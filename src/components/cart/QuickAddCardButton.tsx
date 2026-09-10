"use client";

import QuickAddModal from "./QuickAddModal";

export interface QuickAddProduct {
  id: number;
  name: string;
  slug: string;
  main_image: string | null;
  price: number | null;
}

interface QuickAddCardButtonProps {
  product: QuickAddProduct;
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable "Add to Cart" trigger used inside product cards (campaign home
 * section, campaign detail page, etc.).
 *
 * It wraps the shared QuickAddModal (same modal that ProductCard uses) in a
 * click-capturing container so the button works when nested inside a <Link> —
 * clicking it opens the quick-add modal instead of navigating.
 */
export default function QuickAddCardButton({
  product,
  disabled = false,
  className = "",
}: QuickAddCardButtonProps) {
  return (
    <div
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
      className={className}
    >
      <QuickAddModal product={product} triggerLabel="Add to Cart" disabled={disabled} />
    </div>
  );
}