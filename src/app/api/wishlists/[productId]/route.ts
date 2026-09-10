import { proxyApiRequest } from "@/lib/proxy";

interface RouteContext {
  params: Promise<{ productId: string }>;
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { productId } = await params;
  return proxyApiRequest(`/wishlists/${encodeURIComponent(productId)}`, request);
}
