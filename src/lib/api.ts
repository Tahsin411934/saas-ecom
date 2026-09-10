import { buildApiUrl } from "@/lib/api-url";
import { rewriteLegacyAssetHosts } from "@/lib/asset-url";

interface ApiOptions extends RequestInit {
  revalidate?: number;
  tags?: string[];
}

/**
 * Raw backend response envelope.
 *
 * The API wraps every payload as `{ status, message, data }` where `data` is
 * either the payload itself (single resources) or `{ items: [...] }`
 * (list endpoints). The frontend conventionally consumes
 * `{ success, message, data }` — the helpers below normalize between the two.
 */
export interface ApiEnvelope<T> {
  status?: string;
  success?: boolean;
  message?: string;
  data?: T | { items?: T[] } | null;
}

export interface NormalizedListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

export interface NormalizedDataResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function isApiSuccess(raw: ApiEnvelope<unknown> | null | undefined): boolean {
  if (!raw) return false;
  return raw.success ?? raw.status === "success";
}

/**
 * Normalizes list endpoint responses (`data.items`) into the frontend's
 * `{ success, message, data: T[] }` shape. Tolerates payloads that are
 * already plain arrays.
 */
export function normalizeApiList<T>(raw: ApiEnvelope<T>): NormalizedListResponse<T> {
  const payload = raw?.data;
  let items: T[] = [];
  if (Array.isArray(payload)) {
    items = payload as T[];
  } else if (payload && typeof payload === "object" && Array.isArray((payload as { items?: T[] }).items)) {
    items = (payload as { items?: T[] }).items as T[];
  }

  return { success: isApiSuccess(raw), message: raw?.message ?? "", data: items };
}

/**
 * Normalizes single-resource responses (only maps `status` → `success`;
 * the payload already lives on `data`). Falls back to `fallback` when the
 * payload is missing. The payload type is intentionally loose (`unknown`)
 * so callers can normalize envelopes of any shape.
 */
export function normalizeApiData<T>(raw: ApiEnvelope<unknown>, fallback: T): NormalizedDataResponse<T> {
  const data = raw?.data;
  return {
    success: isApiSuccess(raw),
    message: raw?.message ?? "",
    data: (data === null || data === undefined ? fallback : data) as T,
  };
}

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { revalidate, tags, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  const shouldBypassCache = revalidate === 0 || fetchOptions.cache === "no-store";
  const response = await fetch(buildApiUrl(endpoint), {
    ...fetchOptions,
    credentials: "include",
    headers,
    ...(shouldBypassCache
      ? { cache: "no-store" }
      : revalidate !== undefined
        ? { next: { revalidate, ...(tags ? { tags } : {}) } }
        : { cache: "no-store" }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error: ${response.status}`);
  }

  // Rewrite any legacy backend hosts (pos.aftsoftandlimited.com) that may be
  // baked into cached/stored data so image URLs always resolve.
  return rewriteLegacyAssetHosts(await response.json());
}