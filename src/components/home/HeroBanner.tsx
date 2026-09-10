"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { type Banner } from "@/services/banner.service";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselDots,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface HeroBannerProps {
  banners: Banner[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  if (!banners.length) return null;

  return (
    <section
      className="w-full bg-gradient-to-br from-green-50 via-white to-green-50"
      aria-label="Promotional banners"
    >
      <div className="mx-auto max-w-[1400px] md:px-4 ">
        <Carousel
          opts={{
            loop: true,
            align: "start",
            duration: 40,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
          className="relative md:rounded-2xl"
        >
          <CarouselContent>
            {banners.map((banner, index) => (
              <CarouselItem key={banner.id}>
                <div className="relative flex min-h-[250px] items-center overflow-hidden md:rounded-2xl md:min-h-[500px]">
                  {/* Full Background Image */}
                  {banner.banner_image && (
                    <Image
                      src={banner.banner_image}
                      alt={banner.title || `Banner ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 1400px"
                      className="object-cover"
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                      unoptimized
                    />
                  )}

                  {/* Overlay for text readability */}
                  <div className="absolute inset-0 bg-black/10" aria-hidden="true" />

                  {/* Content */}
                  <div className="relative z-10 flex w-full flex-col items-start gap-5 px-8 md:px-16">
                    {/* Small Tag */}
                    {banner.smtag && (
                      <span className="inline-flex items-center rounded-full bg-[var(--color-primary)]/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                        {banner.smtag}
                      </span>
                    )}

                    {/* Title */}
                    {banner.title && (
                      <h1 className="max-w-xl text-xl md:text-3xl font-semibold leading-tight text-gray-800 drop-shadow-lg md:text-4xl lg:text-5xl xl:text-[55px] xl:leading-[1.15]">
                        {banner.title.includes("\n")
                          ? banner.title.split("\n").map((line, i) => (
                            <span key={i}>
                              {i > 0 && <br />}
                              {line}
                            </span>
                          ))
                          : (() => {
                            const words = banner.title.split(" ");
                            const firstLine = words.slice(0, 2).join(" ");
                            const secondLine = words.slice(2).join(" ");
                            return (
                              <>
                                <span>{firstLine}</span>
                                <br />
                                <span>{secondLine}</span>
                              </>
                            );
                          })()}
                      </h1>
                    )}

                    {/* Subtitle */}
                    {banner.subtitle && (
                      <p className="hidden md:flex max-w-lg text-sm leading-relaxed text-gray-600 drop-shadow md:text-base">
                        {banner.subtitle}
                      </p>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      {banner.primary_btn && (
                        <Link
                          href={banner.primary_btn_url || '/shop'}
                          className="inline-flex h-8 lg:h-12 items-center gap-2 rounded-full px-5 lg:px-7 text-sm font-semibold shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
                          style={{
                            backgroundColor: banner.primary_btn_color || '#1A462F',
                            color: banner.primary_btn_text_color || '#ffffff',
                          }}
                          aria-label={`Shop now: ${banner.primary_btn}`}
                        >
                          {banner.primary_btn}
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      )}
                      {banner.secondary_btn && (
                        <Link
                          href={banner.secondary_btn_url || '/shop'}
                          className="hidden md:inline-flex h-12 items-center rounded-full border px-7 text-sm font-semibold shadow-lg backdrop-blur-sm transition-all hover:opacity-90"
                          style={{
                            backgroundColor: banner.secondary_btn_color || '#ffffff',
                            borderColor: banner.secondary_btn_color || 'rgba(255,255,255,0.4)',
                            color: banner.secondary_btn_text_color || '#1f2937',
                          }}
                          aria-label={banner.secondary_btn}
                        >
                          {banner.secondary_btn}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Dot indicators */}
          <div className="mt-4 min-h-4">
            <CarouselDots />
          </div>
        </Carousel>
      </div>
    </section>
  );
}