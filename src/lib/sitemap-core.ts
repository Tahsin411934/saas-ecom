import { campaignService } from "@/services/campaign.service";
import { categoryProductsService } from "@/services/category-products.service";
import { categoryService } from "@/services/category.service";
import { navbarService } from "@/services/navbar.service";
import { sitemapService } from "@/services/sitemap.service";
import type { Category } from "@/types/category";

// ---------------------------------------------------------------------------
// Shared core for the explicit sitemap route handlers:
//   /sitemap.xml             → XML Sitemap Index (lists all chunk files)
//   /sitemap/static.xml      → home + categories + sub-navbars + campaigns
//   /sitemap/products-0.xml  → product chunk 0, products-1.xml, ...
//     (rewritten in next.config.ts to the dot-free internal route
//      /sitemap-chunk/<n> — Turbopack does not match dynamic segments
//      whose URL segment contains a dot)
//
// Deterministic route handlers (not Next's auto-index) so the canonical
// /sitemap.xml URL always works — even when the metadata generator does not.
// ---------------------------------------------------------------------------

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://onehaatbd.com").replace(/[\/]+$/, "");

// One file may hold at most 50 000 URLs / 50 MB. 25k keeps each XML light
// and the Laravel page query cheap. The same number is passed as the backend
// ?limit= so both sides can never disagree.
export const PRODUCTS_PER_CHUNK = 25_000;
// Safety valve: total budget of 500k product URLs (MAX_CHUNKS x 25k) across
// all chunk files.
export const MAX_CHUNKS = 20;
// Ceiling for the degraded path that derives slugs from category listings.
export const MAX_FALLBACK_PRODUCTS = 45_000;

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
}

/**
 * Build a single sitemap entry for `path`, rooted at the canonical site URL.
 * `lastModified` is only emitted when real data exists so the sitemap never
 * claims a page changed when it did not.
 */
export function page(
  path: string,
  {
    lastModified,
    changeFrequency,
    priority,
  }: {
    lastModified?: Date;
    changeFrequency?: SitemapEntry["changeFrequency"];
    priority?: number;
  } = {}
): SitemapEntry {
  return {
    url: `${BASE_URL}${path === "/" ? "" : path}`,
    ...(lastModified ? { lastModified } : {}),
    ...(changeFrequency ? { changeFrequency } : {}),
    ...(priority !== undefined ? { priority } : {}),
  };
}

// Deterministic ordering keeps output stable and diffs small across deploys.
export function sortEntries(entries: SitemapEntry[]): SitemapEntry[] {
  return entries.sort((a, b) => (a.url > b.url ? 1 : 0) - (a.url < b.url ? 1 : 0));
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Serialize `entries` into a complete `<urlset>` XML document. */
export function xmlUrlset(entries: SitemapEntry[]): string {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastModified
        ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>`
        : "";
      const freq = entry.changeFrequency
        ? `<changefreq>${entry.changeFrequency}</changefreq>`
        : "";
      const priority = entry.priority !== undefined
        ? `<priority>${entry.priority}</priority>`
        : "";
      return `<url><loc>${escapeXml(entry.url)}</loc>${lastmod}${freq}${priority}</url>`;
    })
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    body,
    `</urlset>`,
  ].join("\n");
}
// Sub-category (subnavbar child) slugs exposed by the navigation menu.
async function getSubnavbarSlugs(): Promise<string[]> {
  try {
    const res = await navbarService.getAll();
    const slugs: string[] = [];
    for (const item of res.data) {
      for (const child of item.children || []) {
        if (child.slug) slugs.push(child.slug);
      }
    }
    return slugs;
  } catch {
    return [];
  }
}

// Active campaign slugs, using their end date as a freshness signal.
async function getActiveCampaigns(): Promise<{ slug: string; endsAt?: Date }[]> {
  try {
    const campaigns = await campaignService.getActive();
    return campaigns
      .filter((c) => !!c.slug)
      .map((c) => ({
        slug: c.slug,
        ...(c.ends_at ? { endsAt: new Date(c.ends_at) } : {}),
      }));
  } catch {
    return [];
  }
}

// Every non-product URL: home, the category tree, sub-navigation and campaign pages.
export async function staticPages(): Promise<SitemapEntry[]> {
  let categories: Category[] = [];
  try {
    categories = (await categoryService.getAll()).data;
  } catch {
    // Fall through with an empty list.
  }

  const [subnavbarSlugs, campaigns] = await Promise.all([
    getSubnavbarSlugs(),
    getActiveCampaigns(),
  ]);

  // Only public, indexable pages. Session/account URLs (cart, checkout,
  // login, orders, wishlist...) are deliberately absent — they are also
  // disallowed in robots.txt and would only waste crawl budget.
  const staticEntries: SitemapEntry[] = [
    page("/", { changeFrequency: "daily", priority: 1.0 }),
    page("/categories", { changeFrequency: "weekly", priority: 0.9 }),
    page("/product-request", { changeFrequency: "monthly", priority: 0.5 }),
  ];

  const categoryPages = categories.map((cat) =>
    page(`/category/${cat.slug}`, { changeFrequency: "weekly", priority: 0.8 })
  );

  const subnavbarPages = subnavbarSlugs.map((slug) =>
    page(`/subnavbar/${slug}`, { changeFrequency: "weekly", priority: 0.7 })
  );

  const campaignPages = campaigns.map((campaign) =>
    page(`/campaigns/${campaign.slug}`, {
      lastModified: campaign.endsAt,
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  return [...staticEntries, ...categoryPages, ...subnavbarPages, ...campaignPages];
}

// ---- Products (chunked via the dedicated Laravel sitemap feed) ----
// Primary path: one page of { slug, updated_at } from the backend, already
// filtered to indexable rows; the Laravel endpoint handles SEO filtering.
export async function getProductChunk(index: number): Promise<SitemapEntry[]> {
  try {
    const products = await sitemapService.getProducts(index + 1, PRODUCTS_PER_CHUNK);
    const entries = products
      .filter((p) => p?.slug)
      .map((p) =>
        page(`/product/${p.slug}`, {
          lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
          changeFrequency: "weekly",
          priority: 0.7,
        })
      );
    if (entries.length > 0) return entries;
    // Successful but empty page (count changed between index and chunk calls)
    // → fall through instead of emitting an empty sub-sitemap file.
  } catch {
    // Dedicated sitemap endpoint(s) not deployed / unreachable yet.
  }

  return getFallbackProductChunk(index);
}

// Degraded path: derive slugs from category listings (works without the new
// Laravel endpoints, but is heavier). Chunk 0 is expected to carry the data.
async function getFallbackProductChunk(index: number): Promise<SitemapEntry[]> {
  const slugs = await aggregateProductSlugsFromCategories();
  return slugs
    .slice(index * PRODUCTS_PER_CHUNK, (index + 1) * PRODUCTS_PER_CHUNK)
    .map((slug) => page(`/product/${slug}`, { changeFrequency: "weekly", priority: 0.7 }));
}

// All published product slugs gathered from each category listing, deduplicated
// with a safety cap (a product can belong to several categories).
async function aggregateProductSlugsFromCategories(): Promise<string[]> {
  const slugs = new Set<string>();

  let categories: Category[] = [];
  try {
    categories = (await categoryService.getAll()).data;
  } catch {
    return [];
  }

  for (const cat of categories) {
    let pageNumber = 1;
    let lastPage = 1;
    try {
      do {
        const data = await categoryProductsService.getBySlug(cat.slug, {
          page: pageNumber,
          per_page: 40,
        });
        for (const product of data.products) {
          if (product.slug) slugs.add(product.slug);
        }
        lastPage = data.meta?.last_page ?? pageNumber;
        pageNumber += 1;
      } while (pageNumber <= lastPage && slugs.size < MAX_FALLBACK_PRODUCTS);
    } catch {
      // Skip a category whose listing is temporarily unavailable.
    }
    if (slugs.size >= MAX_FALLBACK_PRODUCTS) break;
  }

  return [...slugs];
}

// Number of product sub-sitemaps to advertise in the index.
export async function getProductChunkCount(): Promise<number> {
  try {
    const data = await sitemapService.getProductCount();
    if (data.total > 0) {
      return Math.min(MAX_CHUNKS, Math.max(1, Math.ceil(data.total / PRODUCTS_PER_CHUNK)));
    }
  } catch {
    // Fall through to the degraded path.
  }
  // Single fallback chunk built from category listings.
  return 1;
}

/** Serialize the XML sitemapindex (the canonical /sitemap.xml) listing every chunk file. */
export async function sitemapIndexXml(): Promise<string> {
  const chunkCount = await getProductChunkCount();
  const locations: string[] = [`${BASE_URL}/sitemap/static.xml`];
  for (let i = 0; i < chunkCount; i += 1) {
    locations.push(`${BASE_URL}/sitemap/products-${i}.xml`);
  }

  const body = locations
    .map((loc) => `<sitemap><loc>${escapeXml(loc)}</loc></sitemap>`)
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    body,
    `</sitemapindex>`,
  ].join("\n");
}