/** Central customer requests have no tenant/domain header. Server-side use only. */
export async function centralFetch(path: string, init: RequestInit = {}) {
  const base = (process.env.NEXT_PUBLIC_API_URL || "https://admin.onehaatbd.com")
    .trim().replace(/\/+$/, "").replace(/\/api(?:\/v\d+)?(?:\/(?:storefront|central))?$/, "");
  const requestHeaders = new Headers(init.headers);
  requestHeaders.set("Accept", "application/json");
  requestHeaders.delete("X-Store-Host");
  return fetch(`${base}/api/v1/central/${path.replace(/^\/+/, "")}`, {
    ...init, headers: requestHeaders, cache: "no-store",
  });
}
