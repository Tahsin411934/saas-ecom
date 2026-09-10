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
      <div className="mx-auto max-w-[1200px] px-4">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {category.image && (
              <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 md:text-2xl">
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
            <CarouselContent className="-ml-3">
              {products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="shrink-0 basis-[calc((100%_-_1.5rem)_/_2.4)] md:basis-1/3 lg:basis-[20%] pl-3"
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