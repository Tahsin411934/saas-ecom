"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
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
    <section className="w-full bg-white pb-5 pt-2 md:pb-6 md:pt-3" aria-label="Shop by category">
      <div className="mx-auto max-w-[1400px] px-3 md:px-6">
        <div className="group/categories relative">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute -left-2 top-9 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm transition-all hover:text-[var(--color-primary)] md:flex md:opacity-0 md:focus-visible:opacity-100 md:group-hover/categories:opacity-100"
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <Carousel
            opts={{
              align: "start",
              containScroll: "trimSnaps",
              loop: false,
              dragFree: true,
            }}
            setApi={setEmblaApi}
            className="overflow-hidden"
          >
            <CarouselContent className="-ml-2">
              {categories.map((category) => (
                <CarouselItem
                  key={category.id}
                  className="basis-[22%] pl-2 sm:basis-1/6 lg:basis-[12.5%] xl:basis-[10%]"
                >
                  <Link
                    href={`/category/${category.slug}`}
                    className="group flex h-full min-w-0 flex-col items-center gap-2 rounded-lg px-1 py-1 text-center outline-offset-2 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
                    aria-label={`Shop ${category.name}`}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-transparent transition-all duration-200 group-hover:ring-[var(--color-primary)] md:h-[72px] md:w-[72px]">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="(max-width: 767px) 56px, 72px"
                          className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary)]/10 text-xl font-bold text-[var(--color-primary)]">
                          {category.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <span className="line-clamp-2 text-center text-[10px] font-medium leading-4 text-gray-800 transition-colors group-hover:text-[var(--color-primary)] md:text-xs">
                      {category.name}
                    </span>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute -right-2 top-9 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm transition-all hover:text-[var(--color-primary)] md:flex md:opacity-0 md:focus-visible:opacity-100 md:group-hover/categories:opacity-100"
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
