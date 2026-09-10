import { api, normalizeApiList, type ApiEnvelope } from "@/lib/api";
import { REVALIDATE } from "@/config/revalidate";
import type { AnnouncementBarResponse, AnnouncementBar } from "@/types/announcement-bar";

export { type AnnouncementBar };

export const announcementBarService = {
  async getAll(): Promise<AnnouncementBarResponse> {
    // Raw payload: { status, message, data: { items: AnnouncementBar[] } } — normalize.
    const res = await api<ApiEnvelope<AnnouncementBar>>("/announcement-bars", {
      revalidate: REVALIDATE.ANNOUNCEMENT,
      tags: ["announcement-bar"],
    });
    return normalizeApiList<AnnouncementBar>(res);
  },
};