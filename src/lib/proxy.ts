import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildApiUrl } from "@/lib/api-url";

/**
 * Proxy a request to a protected backend endpoint.
 *
 * The browser's request arrives WITHOUT the auth cookie on the backend host
 * (cookies live on the frontend domain). So we read the `token` cookie
 * server-side and forward it as an `Authorization: Bearer ...` header.
 *
 * Used by API route handlers:
 *   export async function GET() { return proxyApiRequest("/api/v1/orders"); }
 *   export async function POST(req: Request) { return proxyApiRequest("/api/v1/checkout", req); }
 *
 * Guest endpoints (guest checkout) set `allowGuest: true` so they can be
 * forwarded without a session token — the `Authorization` header is simply
 * omitted for those requests.
 */
export async function proxyApiRequest(
  endpoint: string,
  request?: Request,
  opts?: { allowGuest?: boolean }
) {
  const token = (await cookies()).get("token")?.value;

  if (!token && !opts?.allowGuest) {
    return NextResponse.json(
      { status: "error", message: "Not authenticated." },
      { status: 401 }
    );
  }

  const method = request?.method ?? "GET";
  const contentType = request?.headers.get("content-type");
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request!.text();

  const response = await fetch(buildApiUrl(endpoint), {
    method,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(contentType ? { "Content-Type": contentType } : {}),
    },
    body,
    cache: "no-store",
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
    },
  });
}