"use client";

import { Heart, Minus, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { removeFromCart, selectCartItems, updateQuantity } from "@/lib/features/cart/cartSlice";
import { selectIsInWishlist, toggleWishlistItem } from "@/lib/features/wishlist/wishlistSlice";
import { requireAuth } from "@/lib/require-auth";
import { trackAddToWishlist, trackRemoveFromCart, trackRemoveFromWishlist } from "@/lib/gtm";
import QuickAddModal from "@/components/cart/QuickAddModal";
import type { ProductCardItem } from "./ProductCard";

type ProductCardActionProps = {
  product: ProductCardItem;
  viewMode: "grid" | "list";
  disabled?: boolean;
  showQuickAdd?: boolean;
};

export default function ProductCardActions({ product, viewMode, disabled = false, showQuickAdd = false }: ProductCardActionProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);

  if (showQuickAdd) {
    const productCartItems = cartItems.filter((item) => item.id === product.id);
    const cartQuantity = productCartItems.reduce((total, item) => total + item.quantity, 0);
    const activeCartItem = productCartItems[productCartItems.length - 1];

    if (cartQuantity > 0 && activeCartItem) {
      const minimumQuantity = Math.max(1, activeCartItem.minimum_order_quantity ?? 1);
      const stockLimit = activeCartItem.stock > 0 ? activeCartItem.stock : 99;
      const stepperClass = viewMode === "grid"
        ? "h-8 rounded-md text-xs"
        : "h-10 rounded-lg text-sm";

      return (
        <div className={`flex w-full items-center justify-between gap-2 border border-[var(--color-primary-muted)] bg-[var(--color-primary-soft)] px-2 ${stepperClass}`}>
          <button
            type="button"
            aria-label={`Decrease ${product.name} quantity`}
            onClick={() => {
              if (activeCartItem.quantity <= minimumQuantity) {
                dispatch(removeFromCart({
                  id: activeCartItem.id,
                  variant_id: activeCartItem.variant_id,
                  variant_option_id: activeCartItem.variant_option_id,
                }));
                trackRemoveFromCart({
                  productId: activeCartItem.id,
                  productName: activeCartItem.name,
                  price: activeCartItem.price,
                  quantity: activeCartItem.quantity,
                  variant: activeCartItem.variant_name,
                });
              } else {
                dispatch(updateQuantity({
                  id: activeCartItem.id,
                  variant_id: activeCartItem.variant_id,
                  variant_option_id: activeCartItem.variant_option_id,
                  quantity: activeCartItem.quantity - 1,
                }));
              }
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-primary-dark)] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span aria-live="polite" className="min-w-8 text-center font-semibold text-[var(--color-primary-dark)]">
            {cartQuantity}
          </span>
          <button
            type="button"
            aria-label={`Increase ${product.name} quantity`}
            disabled={disabled || activeCartItem.quantity >= stockLimit}
            onClick={() => dispatch(updateQuantity({
              id: activeCartItem.id,
              variant_id: activeCartItem.variant_id,
              variant_option_id: activeCartItem.variant_option_id,
              quantity: activeCartItem.quantity + 1,
            }))}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--color-primary-dark)] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

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
      className="absolute right-1 top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors hover:bg-[var(--color-primary-soft)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]">
      <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
    </button>
  );
}
