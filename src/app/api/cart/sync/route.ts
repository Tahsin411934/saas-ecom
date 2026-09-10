import { proxyApiRequest } from "@/lib/proxy";

export async function POST(request: Request) {
  return proxyApiRequest("/api/v1/carts/sync", request);
}
