"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock3, MapPin, Package, Search, Truck, X } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type OrderSummary = { id: number; order_number: string; status: string; placed_at: string | null; items_count: number; grand_total: number; currency_code: string; tracking_number?: string | null };
type OrderDetails = OrderSummary & { items: Array<{ id: number; name: string; variant_name?: string | null; sku?: string | null; quantity: number; line_total: number }>; delivery?: { delivery_address: string; delivery_city: string; delivery_phone: string } | null; timeline: Array<{ key: string; title: string; description: string; state: "completed" | "current" | "upcoming"; occurred_at: string | null }> };

const formatStatus = (status: string) => status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const money = (amount: number, currency = "BDT") => new Intl.NumberFormat("en-BD", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);

function OrdersContent() {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/orders", { cache: "no-store" }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load your orders.");
      setOrders(data.orders ?? []);
    }).catch((reason) => setError(reason.message || "Could not load your orders.")).finally(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => orders.filter((order) => order.order_number.toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const closeModal = () => { setSelectedOrder(null); setDetailsLoading(false); };
  const openOrder = async (orderId: number) => {
    setDetailsLoading(true); setSelectedOrder(null);
    try {
      const response = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load order details.");
      setSelectedOrder(data.order);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load order details."); }
    finally { setDetailsLoading(false); }
  };

  return <div className="min-h-screen bg-gray-50 py-8"><div className="mx-auto max-w-[800px] px-4">
    <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
    <div className="mb-6 flex items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-gray-900">My Orders</h1><p className="text-sm text-gray-500">View your order details and delivery progress</p></div><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders..." className="w-48 rounded-lg border border-gray-200 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" /></div></div>
    {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {loading ? <div className="rounded-xl border border-gray-100 bg-white p-12 text-center text-sm text-gray-500">Loading orders…</div> : filteredOrders.length === 0 ? <div className="rounded-xl border border-gray-100 bg-white p-12 text-center"><Package className="mx-auto mb-4 h-16 w-16 text-gray-200" /><h3 className="mb-1 text-lg font-semibold text-gray-900">No orders found</h3><p className="mb-6 text-sm text-gray-500">Start shopping to see your orders here</p><Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white">Start Shopping</Link></div> : <div className="space-y-4">{filteredOrders.map((order) => <button key={order.id} onClick={() => openOrder(order.id)} className="w-full rounded-xl border border-gray-100 bg-white p-5 text-left transition-shadow hover:shadow-sm"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F0FDF4]"><Package className="h-6 w-6 text-[var(--color-primary)]" /></div><div><p className="text-sm font-semibold text-gray-900">{order.order_number}</p><p className="text-xs text-gray-500">{order.placed_at ? new Date(order.placed_at).toLocaleDateString("en-BD", { dateStyle: "medium" }) : "-"} • {order.items_count} items</p></div></div><div className="flex items-center gap-3"><div className="text-right"><p className="text-sm font-bold text-gray-900">{money(order.grand_total, order.currency_code)}</p><span className="mt-1 inline-block rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">{formatStatus(order.status)}</span></div><ChevronRight className="h-5 w-5 text-gray-400" /></div></div></button>)}</div>}
  </div>
  <Dialog open={detailsLoading || !!selectedOrder} onOpenChange={(open) => { if (!open) closeModal(); }}><DialogContent className="w-[min(95vw,58rem)] rounded-2xl p-0"><DialogHeader className="sticky top-0 z-10 border-b border-gray-100 bg-white px-5 py-4 sm:px-6"><div className="flex items-start justify-between gap-3"><div><DialogTitle>{selectedOrder?.order_number || "Loading order…"}</DialogTitle><DialogDescription>{selectedOrder?.tracking_number ? `Tracking: ${selectedOrder.tracking_number}` : "Order details and delivery progress"}</DialogDescription></div><button onClick={closeModal} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button></div></DialogHeader>
  {detailsLoading ? <div className="p-10 text-center text-sm text-gray-500">Loading order details…</div> : selectedOrder && <div className="grid gap-6 p-5 sm:grid-cols-[1.1fr_.9fr] sm:p-6"><section><h2 className="mb-3 font-semibold text-gray-900">Order items</h2><div className="space-y-3">{selectedOrder.items.map((item) => <div key={item.id} className="flex justify-between gap-3 rounded-xl bg-gray-50 p-3"><div><p className="text-sm font-medium text-gray-900">{item.name}</p><p className="text-xs text-gray-500">{item.variant_name || item.sku || "Standard"} · Qty {item.quantity}</p></div><p className="text-sm font-semibold text-gray-900">{money(item.line_total, selectedOrder.currency_code)}</p></div>)}</div><div className="mt-4 flex justify-between border-t border-gray-100 pt-4 text-sm font-bold text-gray-900"><span>Total</span><span>{money(selectedOrder.grand_total, selectedOrder.currency_code)}</span></div>{selectedOrder.delivery && <div className="mt-6 rounded-xl border border-gray-100 p-4"><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900"><MapPin className="h-4 w-4 text-[var(--color-primary)]" /> Delivery address</div><p className="text-sm text-gray-600">{selectedOrder.delivery.delivery_address}, {selectedOrder.delivery.delivery_city}</p><p className="mt-1 text-xs text-gray-500">{selectedOrder.delivery.delivery_phone}</p></div>}</section><section><h2 className="mb-4 flex items-center gap-2 font-semibold text-gray-900"><Truck className="h-5 w-5 text-[var(--color-primary)]" /> Delivery timeline</h2><ol>{selectedOrder.timeline.map((step, index) => <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0"><div className="flex flex-col items-center"><div className={`z-10 flex h-7 w-7 items-center justify-center rounded-full ${step.state === "upcoming" ? "bg-gray-100 text-gray-400" : "bg-[var(--color-primary)] text-white"}`}>{step.state === "upcoming" ? <Clock3 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</div>{index < selectedOrder.timeline.length - 1 && <div className={`mt-1 h-full w-px ${step.state === "completed" ? "bg-[var(--color-primary)]" : "bg-gray-200"}`} />}</div><div className="pb-1"><p className={`text-sm font-semibold ${step.state === "upcoming" ? "text-gray-400" : "text-gray-900"}`}>{step.title}</p><p className="text-xs text-gray-500">{step.description}</p>{step.occurred_at && <p className="mt-1 text-xs text-gray-400">{new Date(step.occurred_at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}</p>}</div></li>)}</ol></section></div>}</DialogContent></Dialog>
  </div>;
}

export default function OrdersPage() { return <AuthGuard><OrdersContent /></AuthGuard>; }
