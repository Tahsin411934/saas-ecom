import Link from "next/link";
import Image from "next/image";
import { buildApiUrl } from "@/lib/api-url";
import { rewriteLegacyAssetHosts } from "@/lib/asset-url";
import { REVALIDATE } from "@/config/revalidate";
import type { Campaign } from "@/services/campaign.service";
import ProductCard from "@/components/ui/ProductCard";
import { toCampaignProductCard } from "@/lib/campaign-product-card";
import type { Metadata } from "next";

// Freshness is centrally controlled via fetch-level revalidate
// (REVALIDATE.CAMPAIGN in src/config/revalidate.ts — see the fetch below).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `/campaigns/${slug}`;

  try {
    const response = await fetch(buildApiUrl(`/campaigns/${slug}`), {
      next: { revalidate: REVALIDATE.CAMPAIGN, tags: [`campaign-${slug}`] },
    });

    if (!response.ok) throw new Error("Campaign not available");

    const { data: campaign } = rewriteLegacyAssetHosts(
      (await response.json()) as { data: Campaign }
    ) as { data: Campaign };
    const description =
      campaign.description || `Shop ${campaign.name} campaign products at OneHaatbd.`;

    return {
      title: `${campaign.name} | OneHaatbd`,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title: `${campaign.name} | OneHaatbd`,
        description,
        url: canonical,
        images: campaign.banner_image ? [{ url: campaign.banner_image, alt: campaign.name }] : [],
      },
    };
  } catch {
    return {
      title: "Campaign | OneHaatbd",
      description: "Browse campaign products at OneHaatbd.",
      alternates: {
        canonical,
      },
    };
  }
}

export default async function CampaignPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await fetch(buildApiUrl(`/campaigns/${slug}`), {
    next: { revalidate: REVALIDATE.CAMPAIGN, tags: [`campaign-${slug}`] },
  });

  if (!response.ok) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Campaign not available</h1>
        <Link className="mt-4 inline-block text-[var(--color-primary)]" href="/">
          Back to home
        </Link>
      </div>
    );
  }

  const { data: campaign } = rewriteLegacyAssetHosts(
    (await response.json()) as { data: Campaign }
  ) as { data: Campaign };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div
        className="mb-8 rounded-2xl p-7"
        style={
          campaign.banner_image
            ? { backgroundColor: "#f97316" }
            : { backgroundColor: "color-mix(in srgb, var(--color-primary) 18%, #ffffff)" }
        }
      >
        <p
          className="text-sm font-semibold uppercase tracking-wider"
          style={
            campaign.banner_image
              ? { color: "rgba(255,255,255,0.8)" }
              : { color: "var(--color-primary)" }
          }
        >
          Special offer
        </p>
        <h1
          className="mt-1 text-3xl font-bold"
          style={{ color: campaign.banner_image ? "#ffffff" : "#111827" }}
        >
          {campaign.name}
        </h1>
        {campaign.description && (
          <p
            className="mt-2 max-w-2xl"
            style={{ color: campaign.banner_image ? "#ffedd5" : "#4b5563" }}
          >
            {campaign.description}
          </p>
        )}
        {campaign.banner_image && (
          <Image
            src={campaign.banner_image}
            alt={campaign.name}
            width={1152}
            height={256}
            sizes="(max-width: 1152px) calc(100vw - 88px), 1064px"
            preload
            className="mt-4 max-h-64 w-full rounded-xl object-cover"
          />
        )}
      </div>

      <div className="products-carousel">
        {campaign.products.map((product) => (
          <div key={product.id} className="product-card-item">
            <ProductCard product={toCampaignProductCard(product)} />
          </div>
        ))}
      </div>
    </main>
  );
}
