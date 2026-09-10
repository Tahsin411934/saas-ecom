"use client";

import Link from "next/link";
import type { Campaign, CampaignProduct } from "@/services/campaign.service";
import QuickAddCardButton from "@/components/cart/QuickAddCardButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

/** Never show a broken "৳0" price — if the computed (discounted) price is invalid
 *  fall back to the regular price. */
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

export default function CampaignSection({ campaigns }: { campaigns: Campaign[] }) {
  if (!campaigns.length) return null;

  return (
    <section className="mx-auto w-full max-w-[1280px] px-4">
      <div className="space-y-8">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="overflow-hidden rounded-2xl "
            style={{
              borderColor: "color-mix(in srgb, var(--color-primary) 40%, transparent)",
              backgroundColor: campaign.banner_image
                ? "color-mix(in srgb, var(--color-primary) 8%, #ffffff)"
                : "color-mix(in srgb, var(--color-primary) 18%, #ffffff)",
            }}
          >
            <div className="relative p-5 sm:p-7">
              {campaign.banner_image && (
                <img
                  src={campaign.banner_image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-20"
                />
              )}

              <div className="relative mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                    Limited-time offer
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">{campaign.name}</h2>
                  {campaign.description && (
                    <p className="mt-1 text-sm text-gray-600">{campaign.description}</p>
                  )}
                </div>

                <Link
                  href={`/campaigns/${campaign.slug}`}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
                >
                  {campaign.button_text}
                </Link>
              </div>

              <Carousel
                opts={{
                  loop: true,
                  align: "start",
                  duration: 40,
                }}
                plugins={[
                  Autoplay({
                    delay: 4000,
                    stopOnInteraction: false,
                    stopOnMouseEnter: true,
                  }),
                ]}
                className="relative"
              >
                <CarouselContent>
                  {campaign.products.map((product) => {
                    const price = displayPrice(product);
                    const off = discountOf(product);
                    const regular = product.regular_price ?? product.original_price;
                    const showRegular = typeof regular === "number" && regular > price;

                    return (
                      <CarouselItem
                        key={product.id}
                        className="min-w-0 basis-[43.5%] lg:basis-[18.9%]"
                      >
                        <Link
                          href={`/product/${product.slug}`}
                          className="block h-full rounded-xl bg-white p-3 shadow-sm hover:shadow-md"
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
                          <p className="mt-2 line-clamp-1 text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="mt-1 flex items-center gap-2">
                            <span className="text-sm font-bold text-orange-600">
                              ৳{price.toLocaleString("en-BD")}
                            </span>
                            {showRegular && (
                              <span className="text-xs text-gray-400 line-through">
                                ৳{regular.toLocaleString("en-BD")}
                              </span>
                            )}
                          </p>
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
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselDots className="mt-4" />
              </Carousel>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
