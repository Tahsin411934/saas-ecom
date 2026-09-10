import type { ApiEnvelope } from "@/lib/api";
import { api } from "@/lib/api";
import { REVALIDATE } from "@/config/revalidate";

/**
 * Narrow "sitemap feed" contract with the Laravel backend.
 *
 * The backend returns ONLY the columns needed to build product URLs
 * (slug + updated_at), already filtered to indexable rows, so 25k-product
 * chunks stay tiny and cheap to generate. Responses are cached via the
 * Next.js Data Cache (`revalidate` + `tags`), so crawler traffic never
 * hits the Laravel API request-by-request.
 */

export interface SitemapProductItem {
  slug: string;
  /** ISO-8601 timestamp of the last meaningful change (sitemap `<lastmod>`). */
  updated_at?: string | null;
}

export interface SitemapCountData {
  /** Total indexable products. */
  total: number;
  /** Chunk size used by the backend page query. */
  chunk_size: number;
  /** Computed page count = ceil(total / chunk_size). */
  pages: number;
}

export interface SitemapProductsData {
  items: SitemapProductItem[];
  page: number;
  limit: number;
  has_more: boolean;
}

export const sitemapService = {
  /** Total number of indexable (active + published + not-deleted) products. */
  async getProductCount(): Promise<SitemapCountData> {
    const res = await api<ApiEnvelope<SitemapCountData>>("/sitemap/products-count", {
      revalidate: REVALIDATE.SITEMAP,
      tags: ["sitemap"],
    });
    const data: SitemapCountData =
      (res.data as SitemapCountData | null | undefined) ?? { total: 0, chunk_size: 25_000, pages: 1 };
    return {
      total: Math.max(0, data.total ?? 0),
      chunk_size: Math.max(1, data.chunk_size ?? 25_000),
      pages: Math.max(1, data.pages ?? 1),
    };
  },

  /**
   * One chunk of product slugs. `page` is 1-based and must match the count
   * endpoint's arithmetic. Only `slug` + `updated_at` are transported.
   */
  async getProducts(page: number, limit = 25_000): Promise<SitemapProductItem[]> {
    const res = await api<ApiEnvelope<SitemapProductsData>>(
      `/sitemap/products?page=${page}&limit=${limit}`,
      {
        revalidate: REVALIDATE.SITEMAP,
        tags: [`sitemap-products-${page}`],
      }
    );
    return (res.data as SitemapProductsData | null | undefined)?.items ?? [];
  },
};