import type { ProductVariant, VariantOption } from "@/types/product";

/** Inventory is available when tracking is disabled, stock remains, or backorders are allowed. */
export function isVariantOptionAvailable(variant: ProductVariant, option?: VariantOption | null): boolean {
  if (!variant.track_inventory || variant.allow_backorder) return true;
  return ((option ? option.stock : variant.stock) ?? 0) > 0;
}

export function isProductVariantAvailable(variant: ProductVariant): boolean {
  return variant.options?.length
    ? variant.options.some((option) => isVariantOptionAvailable(variant, option))
    : isVariantOptionAvailable(variant);
}

export function getVariantLabel(variant: ProductVariant): string {
  return variant.attributes?.size || variant.name || `Variant ${variant.id}`;
}
