import { api } from "@/lib/api";
import { REVALIDATE } from "@/config/revalidate";
import type { ProductDetailResponse, ProductDetailData, ProductVariant, VariantOption } from "@/types/product";

export { type ProductDetailData, type ProductVariant, type VariantOption };

export const productDetailService = {
  async getBySlug(slug: string): Promise<ProductDetailData> {
    const res = await api<ProductDetailResponse>(`/products/${slug}`, {
      revalidate: REVALIDATE.PRODUCT,
      tags: [`product-${slug}`],
    });
    return res.data;
  },
};