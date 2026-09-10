import Link from "next/link";
import { buildApiUrl } from "@/lib/api-url";
import { rewriteLegacyAssetHosts } from "@/lib/asset-url";
import { REVALIDATE } from "@/config/revalidate";
import type { Campaign, CampaignProduct } from "@/services/campaign.service";
import QuickAddCardButton from "@/components/cart/QuickAddCardButton";

// Freshness is centrally controlled via fetch-level revalidate
// (REVALIDATE.CAMPAIGN in src/config/revalidate.ts — see the fetch below).

function displayPrice(p: CampaignProduct): number {
  const final = typeof p.price === "number" && isFinite(p.price) && p.price > 0 ? p.price : null;
  const regular = p.regular_price ?? p.original_price;
  return final ?? (typeof regular === "number" && isFinite(regular) ? regular : 0);
}

function discountOf(p: CampaignProduct): number {
  const final = p.price;
  const regular = p.regular_price ?? p.original_price;
  if (
    p.has_discount !== false &&
    typeof final === "number" &&
    final > 0 &&
    typeof regular === "number" &&
    regular > final
  ) {
    return p.discount_percent ?? Math.round(((regular - final) / regular) * 100);
  }
  return 0;
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
          <img
            src={campaign.banner_image}
            alt={campaign.name}
            className="mt-4 max-h-64 w-full rounded-xl object-cover"
          />
        )}
      </div>

      <div className="products-carousel">
        {campaign.products.map((product) => {
          const price = displayPrice(product);
          const off = discountOf(product);
          const regular = product.regular_price ?? product.original_price;
          const showRegular = typeof regular === "number" && regular > price;

          return (
            <div key={product.id} className="product-card-item">
              <Link
                href={`/product/${product.slug}`}
                className="block overflow-hidden rounded-xl border bg-white p-3 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  {product.main_image && (
                    <img
                      src={product.main_image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {off > 0 && (
                    <span className="absolute left-2 top-2 rounded bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                      -{off}%
                    </span>
                  )}
                </div>
                <h2 className="mt-3 line-clamp-1 font-semibold text-gray-900">{product.name}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-bold text-orange-600">
                    ৳{price.toLocaleString("en-BD")}
                  </span>
                  {showRegular && (
                    <span className="text-xs text-gray-400 line-through">
                      ৳{regular.toLocaleString("en-BD")}
                    </span>
                  )}
                </div>
                <QuickAddCardButton
                  product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    main_image: product.main_image ?? null,
                    price,
                  }}
                  className="mt-2"
                />
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
