import { headers } from "next/headers";

/** Server-only transport: derive tenant identity from this storefront, never browser input. */
export async function storefrontFetch(path: string, init: RequestInit = {}) {
  const incoming = await headers();
  const host = process.env.STOREFRONT_HOST?.trim() || incoming.get("host");
  if (!host) throw new Error("Storefront host is unavailable.");
  const requestHeaders = new Headers(init.headers);
  requestHeaders.set("Accept", "application/json");
  requestHeaders.set("X-Store-Host", host);
  const base = (process.env.NEXT_PUBLIC_API_URL || "https://admin.onehaatbd.com")
    .trim().replace(/\/+$/, "").replace(/\/api(?:\/v\d+)?(?:\/storefront)?$/, "");
  return fetch(`${base}/api/v1/storefront/${path.replace(/^\/+/, "")}`, {
    ...init, headers: requestHeaders, cache: "no-store",
  });
}
