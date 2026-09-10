import { proxyApiRequest } from "@/lib/proxy";

export async function POST(request: Request) {
  return proxyApiRequest("/wishlists/toggle", request);
}
