import { proxyApiRequest } from "@/lib/proxy";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyApiRequest(`/api/v1/orders/${encodeURIComponent(id)}`);
}
