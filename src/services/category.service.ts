import { api, normalizeApiList, normalizeApiData, type ApiEnvelope } from "@/lib/api";
import { REVALIDATE } from "@/config/revalidate";
import type { CategoryResponse, SingleCategoryResponse, Category } from "@/types/category";

export { type Category };

export const categoryService = {
  async getAll(): Promise<CategoryResponse> {
    // Raw payload: { status, message, data: { items: Category[] } } — normalize.
    const res = await api<ApiEnvelope<Category>>("/categories", {
      revalidate: REVALIDATE.CATEGORY,
      tags: ["categories"],
    });
    return normalizeApiList<Category>(res);
  },

  async getBySlug(slug: string): Promise<SingleCategoryResponse> {
    // Raw payload: { status, message, data: Category } — map status → success.
    const res = await api<ApiEnvelope<Category>>(`/categories/${slug}`, {
      revalidate: REVALIDATE.CATEGORY,
      tags: [`category-${slug}`],
    });
    return normalizeApiData<Category | null>(res, null);
  },
};