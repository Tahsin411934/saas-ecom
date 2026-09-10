import { proxyApiRequest } from "@/lib/proxy";

/**
 * Guest checkout — runs WITHOUT an auth token. The backend endpoint
 * (`POST /api/v1/guest-checkout`) accepts items + name + delivery details
 * so a logged-out visitor can complete an order.
 */
export async function POST(request: Request) {
  return proxyApiRequest("/api/v1/guest-checkout", request, { allowGuest: true });
}