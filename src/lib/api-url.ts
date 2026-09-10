export function buildApiUrl(path: string): string {
  const configuredBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "https://admin.onehaatbd.com").trim();
  const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, "");
  const endpoint = path.startsWith("/") ? path : `/${path}`;

  const baseHasApiPrefix = /\/api(?:\/v\d+)?$/i.test(normalizedBaseUrl);
  if (baseHasApiPrefix && /^\/api(?:\/v\d+)?/i.test(endpoint)) {
    return `${normalizedBaseUrl}${endpoint.replace(/^\/api(?:\/v\d+)?/i, "")}`;
  }

  return `${normalizedBaseUrl}${endpoint}`;
}
