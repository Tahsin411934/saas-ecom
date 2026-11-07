import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ui/ProductCard";
import { type CategorySection as CategorySectionType } from "@/services/home.service";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

interface CategorySectionProps {
  category: CategorySectionType["category"];
  products: CategorySectionType["products"];
}

export default function CategorySection({ category, products }: CategorySectionProps) {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-[1400px] px-3 md:px-6">
        {/* Category Header */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {category.image && (
              <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-gray-900 md:text-lg">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          <Link
            href={`/category/${category.slug}`}
            className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors shrink-0"
            aria-label={`View all products in ${category.name}`}
          >
            View All &rarr;
          </Link>
        </div>

        {/* Product Carousel */}
        {products.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: false,
              dragFree: true,
            }}
            className="relative"
          >
            <CarouselContent className="-ml-2 items-stretch md:-ml-3">
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-[44%] pl-2 sm:basis-1/3 md:pl-3 lg:basis-1/5 xl:basis-1/6"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-white border-gray-200 text-gray-600 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]" />
            <CarouselNext className="hidden md:flex -right-4 bg-white border-gray-200 text-gray-600 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]" />
          </Carousel>
        ) : (
          <div className="py-12 text-center text-gray-400 text-sm">
            <p>No products available in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
