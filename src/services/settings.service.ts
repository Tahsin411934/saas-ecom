import { api, normalizeApiData, type ApiEnvelope } from "@/lib/api";
import { REVALIDATE } from "@/config/revalidate";
import type { SettingsResponse } from "@/types/settings";

type SettingsPayload = Record<string, string | null>;

export const settingsService = {
  async getAll(): Promise<SettingsResponse> {
    // Raw payload: { status, message, data: { ...settings } } — map status → success.
    const res = await api<ApiEnvelope<SettingsPayload>>("/settings", {
      revalidate: REVALIDATE.SETTINGS,
      tags: ["settings"],
    });
    return normalizeApiData<SettingsPayload>(res, {});
  },
};