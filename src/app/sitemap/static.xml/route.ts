import { sortEntries, staticPages, xmlUrlset } from "@/lib/sitemap-core";

// ISR: Next caps a route's revalidate at the shortest revalidate of the data
// it fetches — the navbar feed here revalidates every 60s (REVALIDATE.NAVBAR),
// so this sub-sitemap effectively rebuilds every minute. Each crawler hit is
// still served from cache rather than hitting the Laravel API.
export const revalidate = 3600;

const XML_HEADERS: Record<string, string> = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=3600",
};

// /sitemap/static.xml → home + categories + sub-navbars + campaigns
export async function GET(): Promise<Response> {
  const entries = sortEntries(await staticPages());
  return new Response(xmlUrlset(entries), { headers: XML_HEADERS });
}