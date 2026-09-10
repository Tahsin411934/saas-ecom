import { api } from "@/lib/api";
import { REVALIDATE } from "@/config/revalidate";
import type { HomeApiResponse, HomeSection, CategorySection, CtaSection } from "@/types/home";
import type { ProductListItem } from "@/types/product";

export { type HomeSection, type CategorySection, type CtaSection };
export type HomeProduct = ProductListItem;

export const homeService = {
  async getHomePageData(params?: {
    limit_categories?: number;
    limit_products?: number;
  }): Promise<HomeSection[]> {
    const query = new URLSearchParams();
    if (params?.limit_categories) query.set("limit_categories", String(params.limit_categories));
    if (params?.limit_products) query.set("limit_products", String(params.limit_products));
    const qs = query.toString();
    const endpoint = `/home/products-by-category${qs ? `?${qs}` : ""}`;
    const res = await api<HomeApiResponse>(endpoint, {
      revalidate: REVALIDATE.HOME_PAGE,
      tags: ["home-page"],
    });
    return res.data;
  },
};