import { ApiError, normalizeApiData, type ApiEnvelope } from "@/lib/api";
import { centralFetch } from "@/lib/central-api";
import { rewriteLegacyAssetHosts } from "@/lib/asset-url";
import type { SettingsResponse } from "@/types/settings";

type SettingsPayload = Record<string, string | null>;

export const settingsService = {
  async getAll(): Promise<SettingsResponse> {
    const response = await centralFetch("settings");
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(error.message || `Settings API Error: ${response.status}`, response.status);
    }
    const res: ApiEnvelope<SettingsPayload> = rewriteLegacyAssetHosts(await response.json());
    return normalizeApiData<SettingsPayload>(res, {});
  },
};
