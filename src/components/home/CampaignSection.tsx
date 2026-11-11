"use client";

import Link from "next/link";
import Image from "next/image";
import type { Campaign } from "@/services/campaign.service";
import ProductCard from "@/components/ui/ProductCard";
import { toCampaignProductCard } from "@/lib/campaign-product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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
                <Image
                  src={campaign.banner_image}
                  alt=""
                  fill
                  sizes="(max-width: 1280px) calc(100vw - 32px), 1248px"
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
                  {campaign.products.map((product) => (
                    <CarouselItem
                      key={product.id}
                      className="min-w-0 basis-[43.5%] lg:basis-[18.9%]"
                    >
                      <ProductCard product={toCampaignProductCard(product)} />
                    </CarouselItem>
                  ))}
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
