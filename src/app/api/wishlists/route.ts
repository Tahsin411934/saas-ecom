import { proxyApiRequest } from "@/lib/proxy";

export async function GET() {
  return proxyApiRequest("/wishlists");
}
