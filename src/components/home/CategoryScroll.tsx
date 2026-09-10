"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { type Category } from "@/services/category.service";

interface CategoryScrollProps {
  categories: Category[];
}

export default function CategoryScroll({
  categories,
}: CategoryScrollProps) {
  const [emblaApi, setEmblaApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, categories]);

  return (
    <section className="w-full py-6" aria-label="Shop by category">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] md:flex"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <Carousel
            opts={{
              align: "start",
              containScroll: "trimSnaps",
              loop: true,
            }}
            plugins={[
              Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true }),
            ]}
            setApi={setEmblaApi}
            className="overflow-hidden"
          >
            <CarouselContent className="flex gap-4 pb-2 scrollbar-hide px-5 md:px-0">
              {categories.map((category) => (
                <CarouselItem
                  key={category.id}
                  className="pl-0 basis-[calc((100vw-4rem)/3.5)] lg:basis-[calc((100vw-4rem)/5.5)] max-w-[220px]"
                >
                  <Link
                    href={`/category/${category.slug}`}
                    className="group flex min-h-full min-w-0 flex-col items-center gap-2 rounded-3xl boeder-none md:border border-gray-200 bg-white px-4 py-4 text-center transition hover:border-[var(--color-primary)] hover:shadow-lg"
                    aria-label={`Shop ${category.name}`}
                  >
                    <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full bg-gray-100 shadow-sm ring-2 ring-transparent transition-all duration-200 group-hover:ring-[var(--color-primary)] group-hover:shadow-md">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="72px"
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/10 text-xl font-bold text-[var(--color-primary)]">
                          {category.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <span className="line-clamp-2 text-center text-xs font-medium leading-tight text-gray-700 transition-colors group-hover:text-[var(--color-primary)]">
                      {category.name}
                    </span>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] md:flex"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
