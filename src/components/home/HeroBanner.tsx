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
      className="w-full bg-white "
      aria-label="Promotional banners"
    >
      <div className="mx-auto max-w-[1290px] ">
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
          <div className="relative">
          <CarouselContent>
            {banners.map((banner, index) => (
              <CarouselItem key={banner.id}>
                <div className="relative flex min-h-[220px] items-center overflow-hidden rounded-xl bg-[var(--color-primary-soft)] md:aspect-[3.5/1] md:min-h-[280px] md:rounded-2xl">
                  {/* Full Background Image */}
                  {banner.banner_image && (
                    <Image
                      src={banner.banner_image}
                      alt={banner.title || `Banner ${index + 1}`}
                      fill
                      sizes="(max-width: 1290px) 100vw, 1290px"
                      className="object-cover"
                      preload={index === 0}
                      loading={index === 0 ? undefined : "lazy"}
                    />
                  )}

                  {/* Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent" aria-hidden="true" />

                  {/* Content */}
                  <div className="relative z-10 flex w-full flex-col items-start gap-3 px-8 py-6 md:gap-3 md:px-14 md:py-8 lg:px-20">
                    {/* Small Tag */}
                    {banner.smtag && (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-primary-dark)] md:text-xs">
                        {banner.smtag}
                      </span>
                    )}

                    {/* Title */}
                    {banner.title && (
                      <h1 className="max-w-[65%] text-2xl font-bold leading-tight tracking-tight text-gray-900 md:max-w-[50%] md:text-3xl lg:text-4xl xl:text-5xl xl:leading-[1.1]">
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
                      <p className="hidden max-w-[45%] text-sm leading-relaxed text-gray-700 md:block lg:text-base">
                        {banner.subtitle}
                      </p>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {banner.primary_btn && (
                        <Link
                          href={banner.primary_btn_url || '/shop'}
                          className="inline-flex h-9 items-center gap-2 rounded-lg px-5 text-xs font-semibold shadow-sm transition-all hover:opacity-90 md:h-10 md:text-sm lg:px-6"
                          style={{
                            backgroundColor: banner.primary_btn_color || 'var(--color-primary)',
                            color: banner.primary_btn_text_color || 'var(--color-primary-foreground)',
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
                          className="hidden h-10 items-center rounded-lg border px-6 text-sm font-semibold shadow-sm transition-all hover:opacity-90 md:inline-flex"
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
          </div>

          {/* Dot indicators */}
          {banners.length > 1 && (
            <div className="flex h-5 items-center justify-center">
              <CarouselDots className="gap-1 [&_button]:h-1 [&_button]:w-1 [&_button[aria-selected=true]]:w-5" />
            </div>
          )}
        </Carousel>
      </div>
    </section>
  );
}
