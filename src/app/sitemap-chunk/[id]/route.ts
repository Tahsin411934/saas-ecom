import { getProductChunk, sortEntries, xmlUrlset } from "@/lib/sitemap-core";
import type { NextRequest } from "next/server";

// ISR on every sub-sitemap: rebuilt in the background hourly so each crawler
// hit is served from cache instead of hitting the Laravel API.
export const revalidate = 3600;

const XML_HEADERS: Record<string, string> = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=3600",
};

/**
 * Internal target of the /sitemap/products-N.xml rewrite (see next.config.ts).
 * The dynamic segment here is dot-free ("0", "1", …) so it matches reliably in
 * both dev (Turbopack) and production builds.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return new Response("Not Found", { status: 404, headers: XML_HEADERS });
  }

  const entries = sortEntries(await getProductChunk(parseInt(id, 10)));
  // A chunk the index did not advertise (e.g. the total shrank between the
  // index and this fetch) must not expose an empty urlset — respond 404 so
  // crawlers drop it instead of recording an invalid sitemap.
  if (entries.length === 0) {
    return new Response("Not Found", { status: 404, headers: XML_HEADERS });
  }

  return new Response(xmlUrlset(entries), { headers: XML_HEADERS });
}