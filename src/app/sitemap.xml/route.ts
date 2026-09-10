import { sitemapIndexXml } from "@/lib/sitemap-core";

// ISR on the index route: rebuilt in the background every hour so each
// crawler hit is served from cache instead of hitting the Laravel API.
export const revalidate = 3600;

const XML_HEADERS: Record<string, string> = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=3600",
};

export async function GET(): Promise<Response> {
  const xml = await sitemapIndexXml();
  return new Response(xml, { headers: XML_HEADERS });
}