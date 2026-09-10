import { proxyApiRequest } from "@/lib/proxy";

export async function GET() {
  return proxyApiRequest("/api/v1/orders");
}
