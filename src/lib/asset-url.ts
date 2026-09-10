/**
 * Asset URL helpers.
 *
 * The backend domain was migrated (pos.aftsoftandlimited.com -> admin.onehaatbd.com).
 * The legacy host is no longer reachable, but image URLs baked into older ISR
 * caches, localStorage (cart/wishlist) or the backend database may still
 * reference it — which renders broken images.
 *
 * These helpers rewrite legacy hosts to the current backend base so every
 * image URL resolves, regardless of where the stale value came from.
 */

const DEFAULT_ASSET_BASE = "https://admin.onehaatbd.com";

/** Hosts that used to serve backend assets but are no longer reachable. */
const LEGACY_HOSTS = ["pos.aftsoftandlimited.com"];

/** Matches `//host`, `http://host` and `https://host` (any path). */
function legacyHostRegex(host: string): RegExp {
  const escaped = host.replace(/\./g, "\\.");
  return new RegExp(`^(?:https?:)?//${escaped}(?=/|$)`, "i");
}

/** Current backend asset base URL (no trailing slash). Safe on client & server. */
export function getAssetBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api(?:\/v\d+)?$/i, "") ||
    process.env.BACKEND_API_URL ||
    DEFAULT_ASSET_BASE;
  return base.replace(/\/+$/, "");
}

function rewriteHosts(value: string): string {
  const base = getAssetBaseUrl();
  let out = value;
  for (const host of LEGACY_HOSTS) {
    out = out.replace(legacyHostRegex(host), base);
  }
  return out;
}

/**
 * Deep-walks an arbitrary JSON structure and rewrites any string that
 * references a legacy backend host to the current asset base URL.
 */
export function rewriteLegacyAssetHosts<T>(value: T): T {
  if (typeof value === "string") {
    return (value.includes("aftsoftandlimited") ? rewriteHosts(value) : value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => rewriteLegacyAssetHosts(item)) as unknown as T;
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      out[key] = rewriteLegacyAssetHosts(entry);
    }
    return out as unknown as T;
  }
  return value;
}

/**
 * Normalizes a single asset URL for rendering:
 * - rewrites legacy backend hosts (`pos.aftsoftandlimited.com`) to the current base
 * - prefixes backend-relative paths (`/storage/...`) with the asset base
 */
export function normalizeAssetUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  const rewritten = rewriteHosts(trimmed);
  if (/^\/(?:storage|images|uploads)\//i.test(rewritten)) {
    return `${getAssetBaseUrl()}${rewritten}`;
  }
  return rewritten;
}
