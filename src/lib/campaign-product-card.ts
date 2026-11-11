import type { CampaignProduct } from "@/services/campaign.service";
import type { ProductCardItem } from "@/components/ui/ProductCard";

/** Adapt the campaign API shape to the shared product card. */
export function toCampaignProductCard(product: CampaignProduct): ProductCardItem {
  const regularPrice = product.regular_price ?? product.original_price;
  const price = typeof product.price === "number" && Number.isFinite(product.price) && product.price >= 0
    ? product.price
    : Number.isFinite(regularPrice) ? regularPrice : null;

  return {
    ...product,
    main_image: product.main_image ?? null,
    price,
    regular_price: regularPrice,
  };
}
