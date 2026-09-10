"use client";

import { type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { toggleWishlistItem, selectIsInWishlist } from "@/lib/features/wishlist/wishlistSlice";
import { requireAuth } from "@/lib/require-auth";
import QuickAddModal from "@/components/cart/QuickAddModal";
import { trackSelectItem, trackAddToWishlist } from "@/lib/gtm";

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
  product_type?: string;
  stock_status?: string;
}

interface ProductCardProps {
  product: ProductCardItem;
  viewMode?: "grid" | "list";
}

export default function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const wishlisted = useAppSelector(selectIsInWishlist(product.id));
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const displayPrice = product.price;
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

  const handleToggleWishlist = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (!requireAuth(isAuthenticated)) return;

    dispatch(
      toggleWishlistItem({
        productId: product.id,
        isWishlisted: wishlisted,
        item: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.main_image,
          price: product.price ?? 0,
        },
      })
    );

    // GTM: Track wishlist add
    if (!wishlisted) {
      trackAddToWishlist({
        productId: product.id,
        productName: product.name,
        price: product.price ?? 0,
        imageUrl: product.main_image || undefined,
      });
    }
  };

  const handleProductClick = () => {
    // GTM: Track product click
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
                  unoptimized
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
              <QuickAddModal
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  main_image: product.main_image,
                  price: product.price ?? 0,
                }}
                triggerLabel="Add to Cart"
                disabled={!inStock}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
      onClick={handleProductClick}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.main_image ? (
          <Image
            src={product.main_image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400" aria-hidden="true">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`}
          />
        </button>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 z-10 rounded bg-red-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-[var(--color-primary)] transition-colors">
          {product.name}
        </h3>
        {product.short_description && (
          <p className="text-xs text-gray-500 line-clamp-1 mb-2">
            {product.short_description}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-[var(--color-primary)]">
            ৳{displayPrice?.toLocaleString("en-BD")}
          </span>
          {regularPrice != null && (
            <span className="text-xs text-gray-400 line-through">
              ৳{regularPrice.toLocaleString("en-BD")}
            </span>
          )}
        </div>
        {!inStock && (
          <span className="mt-1 inline-block text-xs font-medium text-red-500">
            Out of Stock
          </span>
        )}
        <div
          className="mt-4"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <QuickAddModal
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              main_image: product.main_image,
              price: product.price ?? 0,
            }}
            triggerLabel="Add to Cart"
            disabled={!inStock}
          />
        </div>
      </div>
    </Link>
  );
}
