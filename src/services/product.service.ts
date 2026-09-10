import { api, normalizeApiList, type ApiEnvelope } from "@/lib/api";
import type { ProductSearchResponse, ProductSearchResult } from "@/types/product";

export { type ProductSearchResult as Product };

export const productService = {
  async search(
    query: string,
    categoryId?: number
  ): Promise<ProductSearchResponse> {
    const params = new URLSearchParams();
    params.set("q", query);
    if (categoryId !== undefined && categoryId > 0) {
      params.set("category_id", String(categoryId));
    }

    // Raw payload: { status, message, data: { query, items, suggestion } } —
    // normalize items into the data array the UI consumes.
    const res = await api<ApiEnvelope<ProductSearchResult>>(`/products/search?${params.toString()}`, {
      revalidate: 0,
    });
    return normalizeApiList<ProductSearchResult>(res);
  },
};