"use client";

import { type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";
import ProductCardActions from "./ProductCardActions";
import { trackSelectItem } from "@/lib/gtm";

// Generic product shape that all product types must conform to
export interface ProductCardItem {
  id: number;
  name: string;
  slug: string;
  short_description?: string | null;
  main_image: string | null;
  /** Price after discount (what the customer pays). */
  price: number | null;
  /** Regular (pre-discount) price - shown struck-through when greater than price. */
  regular_price?: number | null;
  /** Effective discount percentage. */
  discount_percent?: number;
  /** Absolute discount amount = regular_price - price. */
  discount_amount?: number;
  /** Whether the product currently has a discount. */
  has_discount?: boolean;
  unit?: {
    id: number;
    name: string;
    short_name: string;
  } | null;
  product_type?: string;
  stock_status?: string;
  rating?: number;
  review_count?: number;
}

interface ProductCardProps {
  product: ProductCardItem;
  viewMode?: "grid" | "list";
}

export default function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const displayPrice = product.price;
  const unitLabel = product.unit?.short_name || product.unit?.name;
  const inStock = product.stock_status !== "out_of_stock";

  // Discount display helpers
  const hasDiscount =
    product.has_discount ??
    (product.price != null &&
      product.regular_price != null &&
      product.regular_price > product.price);
  const discountPercent =
    hasDiscount && product.regular_price && product.regular_price > 0
      ? (product.discount_percent ??
        Math.round(
          ((product.regular_price - (product.price ?? product.regular_price)) /
            product.regular_price) *
            100
        ))
      : 0;
  const regularPrice =
    hasDiscount && product.regular_price != null ? product.regular_price : null;

  const handleProductClick = (_event: MouseEvent<HTMLAnchorElement>) => {
    trackSelectItem({
      productId: product.id,
      productName: product.name,
      price: product.price ?? 0,
    });
  };

  if (viewMode === "list") {
    return (
      <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all p-3 md:p-4">
        <div className="flex flex-col gap-4 md:flex-row">
          <Link
            href={`/product/${product.slug}`}
            className="flex shrink-0 items-center"
            onClick={handleProductClick}
          >
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-100">
              {product.main_image ? (
                <Image
                  src={product.main_image}
                  alt={product.name}
                  fill
                  sizes="128px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"

                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-400">
                  <ShoppingCart className="h-8 w-8" />
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0 flex flex-col justify-between gap-4">
            <div>
              <Link
                href={`/product/${product.slug}`}
                className="block"
                aria-label={`View ${product.name}`}
                onClick={handleProductClick}
              >
                <h3 className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                  {product.name}
                </h3>
                {product.short_description && (
                  <p className="text-xs md:text-sm text-gray-500 mt-1 line-clamp-2">
                    {product.short_description}
                  </p>
                )}
              </Link>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-lg font-bold text-[var(--color-primary)]">
                  ৳{displayPrice?.toLocaleString("en-BD")}
                </span>
                {unitLabel && <span className="text-xs text-gray-500">/ {unitLabel}</span>}
                {regularPrice != null && (
                  <span className="text-sm text-gray-400 line-through">
                    ৳{regularPrice.toLocaleString("en-BD")}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-xs font-bold text-red-500">
                    -{discountPercent}%
                  </span>
                )}
              </div>
              {!inStock && (
                <span className="mt-1 text-xs font-medium text-red-500">Out of Stock</span>
              )}
            </div>
            <div className="mt-2 w-full md:w-auto">
              <ProductCardActions product={product} viewMode="list" disabled={!inStock} showQuickAdd />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-gray-100 bg-white transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <Link href={`/product/${product.slug}`} onClick={handleProductClick} aria-label={`View ${product.name}`} className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-emerald-600">
          {product.main_image ? (
            <Image src={product.main_image} alt={product.name} fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 225px"
              className="object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300" aria-hidden="true"><ShoppingCart className="h-10 w-10" /></div>
          )}
        </Link>
        <ProductCardActions product={product} viewMode="grid" disabled={!inStock} />
        {discountPercent > 0 && (
          <span className="pointer-events-none absolute left-1 top-1 z-10 rounded bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">-{discountPercent}%</span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-2">
        <Link href={`/product/${product.slug}`} onClick={handleProductClick} className="rounded-sm focus-visible:outline-2 focus-visible:outline-emerald-600">
          <h3 className="mb-1 min-h-8 text-xs font-medium leading-4 text-gray-900 line-clamp-2 transition-colors hover:text-emerald-700">{product.name}</h3>
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={`text-sm font-bold ${hasDiscount ? "text-rose-500" : "text-gray-900"}`}>৳{displayPrice?.toLocaleString("en-BD")}</span>
          {unitLabel && <span className="text-[10px] text-gray-500">/ {unitLabel}</span>}
          {regularPrice != null && <span className="text-[10px] text-gray-400 line-through">৳{regularPrice.toLocaleString("en-BD")}</span>}
        </div>
        <div className="mb-2 mt-1 flex min-h-4 items-center gap-1 text-[10px] leading-4 text-gray-500">
          {product.rating != null && Number.isFinite(product.rating) && (
            <>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
              <span aria-label={`Rated ${product.rating.toFixed(1)} out of 5`}>{product.rating.toFixed(1)}</span>
              {product.review_count != null && <span>({product.review_count.toLocaleString("en-BD")})</span>}
            </>
          )}
        </div>
        {!inStock && <span className="mt-1 inline-block text-xs font-medium text-red-500">Out of Stock</span>}
        <div className="mt-auto pt-1">
          <ProductCardActions product={product} viewMode="grid" disabled={!inStock} showQuickAdd />
        </div>
      </div>
    </article>
  );
}
