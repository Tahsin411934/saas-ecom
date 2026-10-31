import { proxyApiRequest } from "@/lib/proxy";

export async function POST(request: Request, context: { params: Promise<{ productId: string }> }) {
  const { productId } = await context.params;
  return proxyApiRequest(`products/${encodeURIComponent(productId)}/reviews`, request);
}
