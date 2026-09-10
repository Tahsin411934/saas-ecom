import { api, normalizeApiList, type ApiEnvelope } from "@/lib/api";
import { REVALIDATE } from "@/config/revalidate";
import type { BannerResponse, Banner } from "@/types/banner";

export { type Banner };

export const bannerService = {
  async getAll(): Promise<BannerResponse> {
    // Raw payload: { status, message, data: { items: Banner[] } } — normalize
    // to the frontend's { success, data } shape.
    const res = await api<ApiEnvelope<Banner>>("/banners", {
      revalidate: REVALIDATE.BANNER,
      tags: ["banners"],
    });
    return normalizeApiList<Banner>(res);
  },
};