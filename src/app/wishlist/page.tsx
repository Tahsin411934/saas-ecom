"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingCart, X } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchWishlistItems,
  removeWishlistItem,
  selectWishlistItems,
} from "@/lib/features/wishlist/wishlistSlice";
import { trackRemoveFromWishlist } from "@/lib/gtm";

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);
  const isLoading = useAppSelector((state) => state.wishlist.isLoading);

  useEffect(() => {
    dispatch(fetchWishlistItems());
  }, [dispatch]);

  if (!isLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-16 pb-24 lg:pb-16">
        <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <Heart className="mx-auto h-12 w-12 text-[var(--color-primary)]" />
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Your wishlist is empty</h1>
          <p className="mt-3 text-sm text-gray-500">Save products to your wishlist and view them here anytime.</p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 pb-24 sm:py-10 lg:pb-10">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 fill-[var(--color-primary)] text-[var(--color-primary)]" />
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Wishlist</h1>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {items.length} {items.length === 1 ? "product" : "products"} saved for later.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" /> Continue shopping
          </Link>
        </div>

        {isLoading ? (
          <div className="products-carousel">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="product-card-item">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="aspect-square animate-pulse bg-gray-100" />
                  <div className="space-y-2 p-3">
                    <div className="h-4 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="products-carousel">
            {items.map((item) => (
              <div key={item.id} className="product-card-item">
                <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <Link href={`/product/${item.slug}`} className="block h-full" aria-label={`View ${item.name}`}>
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <ShoppingCart className="h-10 w-10" />
                        </div>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(removeWishlistItem(item.id));
                        // GTM: Track remove from wishlist
                        trackRemoveFromWishlist({
                          productId: item.id,
                          productName: item.name,
                          price: item.price,
                        });
                      }}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-sm transition-colors hover:bg-red-50"
                      aria-label={`Remove ${item.name} from wishlist`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    <Link
                      href={`/product/${item.slug}`}
                      className="block truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-[var(--color-primary)]"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-base font-bold text-gray-900">৳{item.price.toLocaleString("en-BD")}</p>
                    <Link
                      href={`/product/${item.slug}`}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)]"
                    >
                      View product
                    </Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
