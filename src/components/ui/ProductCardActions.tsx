"use client";

import { Heart } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectIsInWishlist, toggleWishlistItem } from "@/lib/features/wishlist/wishlistSlice";
import { requireAuth } from "@/lib/require-auth";
import { trackAddToWishlist, trackRemoveFromWishlist } from "@/lib/gtm";
import QuickAddModal from "@/components/cart/QuickAddModal";
import type { ProductCardItem } from "./ProductCard";

type ProductCardActionProps = {
  product: ProductCardItem;
  viewMode: "grid" | "list";
  disabled?: boolean;
  showQuickAdd?: boolean;
};

export default function ProductCardActions({ product, viewMode, disabled = false, showQuickAdd = false }: ProductCardActionProps) {
  if (showQuickAdd) {
    return (
      <QuickAddModal
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          main_image: product.main_image,
          price: product.price ?? 0,
        }}
        triggerLabel="Add to Cart"
        disabled={disabled}
        triggerClassName={viewMode === "grid"
          ? "h-8 w-full rounded-md bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] px-2 text-[11px] font-semibold text-white shadow-none transition-colors hover:from-[var(--color-primary-hover)] hover:to-[var(--color-primary)]"
          : undefined}
      />
    );
  }

  return <WishlistButton product={product} />;
}

function WishlistButton({ product }: { product: ProductCardItem }) {
  const dispatch = useAppDispatch();
  const wishlisted = useAppSelector(selectIsInWishlist(product.id));
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleToggle = () => {
    if (!requireAuth(isAuthenticated)) return;

    dispatch(toggleWishlistItem({
      productId: product.id,
      isWishlisted: wishlisted,
      item: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        image: product.main_image,
        price: product.price ?? 0,
      },
    }));

    if (wishlisted) {
      trackRemoveFromWishlist({ productId: product.id, productName: product.name, price: product.price ?? 0 });
    } else {
      trackAddToWishlist({ productId: product.id, productName: product.name, price: product.price ?? 0, imageUrl: product.main_image || undefined });
    }
  };

  return (
    <button type="button" onClick={handleToggle} aria-pressed={wishlisted}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-emerald-600">
      <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
    </button>
  );
}
