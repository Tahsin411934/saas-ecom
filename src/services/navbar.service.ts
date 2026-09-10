import { api, normalizeApiList, type ApiEnvelope } from "@/lib/api";
import { REVALIDATE } from "@/config/revalidate";
import type { NavbarResponse, NavbarItem } from "@/types/navbar";

export { type NavbarItem };

export const navbarService = {
  async getAll(): Promise<NavbarResponse> {
    // Raw payload: { status, message, data: { items: NavbarItem[] } } — normalize.
    const res = await api<ApiEnvelope<NavbarItem>>("/navbar-items", {
      revalidate: REVALIDATE.NAVBAR,
      tags: ["navbar"],
    });
    return normalizeApiList<NavbarItem>(res);
  },
};