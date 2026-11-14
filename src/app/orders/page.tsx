"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock3, MapPin, Package, Search, Truck, X } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type OrderSummary = {
  id: number;
  order_number: string;
  status: string;
  placed_at: string | null;
  items_count: number;
  grand_total: number;
  currency_code: string;
  tracking_number?: string | null;
};
type OrderItem = { id: number; name: string; variant_name?: string | null; sku?: string | null; quantity: number; unit_price?: number; line_total: number };
type TimelineStep = { key: string; title: string; description: string; state: "completed" | "current" | "upcoming"; occurred_at: string | null };
type OrderDetails = OrderSummary & {
  items: OrderItem[];
  delivery?: { status?: string; delivery_address: string; delivery_city: string; delivery_phone: string; delivery_notes?: string | null } | null;
  timeline: TimelineStep[];
};

const formatStatus = (status: string) => (status || "pending").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const money = (amount: number, currency = "BDT") => {
  try {
    return new Intl.NumberFormat("en-BD", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount) || 0);
  } catch {
    return `${currency} ${(Number(amount) || 0).toLocaleString("en-BD")}`;
  }
};
const date = (value: string | null, includeTime = false) => value
  ? new Intl.DateTimeFormat("en-BD", includeTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(new Date(value))
  : "—";
const statusClass = (status: string) => {
  const normalized = (status || "").toLowerCase();
  if (["delivered", "completed"].includes(normalized)) return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  if (["cancelled", "canceled", "failed", "refunded"].includes(normalized)) return "bg-red-50 text-red-700 ring-red-600/20";
  return "bg-amber-50 text-amber-800 ring-amber-600/20";
};

function unwrapOrders(payload: unknown): OrderSummary[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as { data?: unknown; orders?: unknown };
  const data = root.data;
  if (Array.isArray(data)) return data as OrderSummary[];
  if (data && typeof data === "object" && Array.isArray((data as { orders?: unknown }).orders)) return (data as { orders: OrderSummary[] }).orders;
  if (Array.isArray(root.orders)) return root.orders as OrderSummary[];
  return [];
}

function unwrapOrder(payload: unknown): OrderDetails | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as { data?: unknown; order?: unknown };
  const data = root.data;
  if (data && typeof data === "object" && "order" in data) return (data as { order: OrderDetails }).order;
  if (data && typeof data === "object" && "order_number" in data) return data as OrderDetails;
  if (root.order && typeof root.order === "object") return root.order as OrderDetails;
  return null;
}

function OrdersContent() {
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/orders", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message || "Could not load your orders.");
        setOrders(unwrapOrders(payload));
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load your orders."))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => orders.filter((order) => (order.order_number || "").toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const closeModal = () => { setSelectedOrder(null); setDetailsLoading(false); };
  const openOrder = async (orderId: number) => {
    setError(null);
    setDetailsLoading(true);
    setSelectedOrder(null);
    try {
      const response = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message || "Could not load order details.");
      const order = unwrapOrder(payload);
      if (!order) throw new Error("Order details could not be read. Please try again.");
      setSelectedOrder({ ...order, items: Array.isArray(order.items) ? order.items : [], timeline: Array.isArray(order.timeline) ? order.timeline : [] });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load order details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  return <div className="min-h-screen bg-slate-50 py-8 sm:py-10">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">My Orders</h1><p className="mt-1 text-sm text-slate-500">Review your purchases and follow delivery progress.</p></div>
        <label className="relative block w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by order number" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10" /></label>
      </div>
      {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">Loading your orders…</div>
        : filteredOrders.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center"><Package className="mx-auto mb-4 h-12 w-12 text-slate-300" /><h2 className="text-lg font-semibold text-slate-900">{search ? "No matching orders" : "No orders yet"}</h2><p className="mt-1 text-sm text-slate-500">{search ? "Try a different order number." : "Your orders will appear here after checkout."}</p>{!search && <Link href="/" className="mt-5 inline-flex rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white">Start shopping</Link>}</div>
        : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[1.3fr_1fr_.7fr_.8fr_auto] items-center gap-4 border-b border-slate-100 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid"><span>Order</span><span>Date</span><span>Items</span><span>Total / status</span><span /></div>
          <div className="divide-y divide-slate-100">{filteredOrders.map((order) => <button key={order.id} onClick={() => openOrder(order.id)} className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 md:grid-cols-[1.3fr_1fr_.7fr_.8fr_auto] md:px-6">
            <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary-dark)]"><Package className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{order.order_number || `Order #${order.id}`}</p><p className="mt-1 text-xs text-slate-500 md:hidden">{date(order.placed_at)} · {order.items_count ?? 0} items</p></div></div>
            <span className="hidden text-sm text-slate-600 md:block">{date(order.placed_at)}</span><span className="hidden text-sm text-slate-600 md:block">{order.items_count ?? 0}</span>
            <div className="text-right md:text-left"><p className="text-sm font-semibold text-slate-900">{money(order.grand_total, order.currency_code)}</p><span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusClass(order.status)}`}>{formatStatus(order.status)}</span></div><ChevronRight className="h-5 w-5 text-slate-400" />
          </button>)}</div>
        </div>}
    </div>

    <Dialog open={detailsLoading || !!selectedOrder} onOpenChange={(open) => { if (!open) closeModal(); }}>
      <DialogContent className="max-h-[calc(100dvh-1.5rem)] w-[min(96vw,64rem)] overflow-y-auto rounded-2xl p-0 sm:max-h-[calc(100dvh-3rem)]">
        <DialogHeader className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-7">
          <div className="flex items-start justify-between gap-4"><div className="min-w-0"><DialogTitle className="truncate text-lg font-bold text-slate-900">{selectedOrder?.order_number || "Order details"}</DialogTitle><DialogDescription className="mt-1">{selectedOrder ? `Placed ${date(selectedOrder.placed_at)}${selectedOrder.tracking_number ? ` · Tracking ${selectedOrder.tracking_number}` : ""}` : "Loading your order…"}</DialogDescription></div><button onClick={closeModal} aria-label="Close order details" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button></div>
        </DialogHeader>
        {detailsLoading ? <div className="p-14 text-center text-sm text-slate-500">Loading order details…</div> : selectedOrder && <div className="space-y-6 p-4 sm:p-7">
          <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Order status</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(selectedOrder.status)}`}>{formatStatus(selectedOrder.status)}</span></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Items</p><p className="mt-2 text-lg font-semibold text-slate-900">{selectedOrder.items_count ?? selectedOrder.items.length}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Order total</p><p className="mt-2 text-lg font-bold text-slate-900">{money(selectedOrder.grand_total, selectedOrder.currency_code)}</p></div></div>
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,.85fr)]">
            <section className="min-w-0"><h2 className="mb-3 text-base font-semibold text-slate-900">Order items</h2>{selectedOrder.items.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No item details are available.</p> : <div className="overflow-hidden rounded-xl border border-slate-200"><div className="hidden grid-cols-[1fr_auto_auto] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid"><span>Product</span><span>Qty</span><span className="text-right">Amount</span></div><div className="divide-y divide-slate-100">{selectedOrder.items.map((item) => <div key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[1fr_auto_auto]"><div className="min-w-0"><p className="break-words text-sm font-medium text-slate-900">{item.name || "Product"}</p><p className="mt-0.5 text-xs text-slate-500">{item.variant_name || item.sku || "Standard"}</p><p className="text-xs text-slate-500 sm:hidden">Qty {item.quantity}</p></div><span className="hidden text-sm text-slate-600 sm:block">{item.quantity}</span><span className="text-right text-sm font-semibold text-slate-900">{money(item.line_total, selectedOrder.currency_code)}</span></div>)}</div></div>}
              <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3"><span className="text-sm font-semibold text-emerald-900">Total paid</span><span className="text-base font-bold text-emerald-900">{money(selectedOrder.grand_total, selectedOrder.currency_code)}</span></div>
              {selectedOrder.delivery && <div className="mt-5 rounded-xl border border-slate-200 p-4"><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900"><MapPin className="h-4 w-4 text-emerald-700" />Delivery address</h3><p className="text-sm leading-6 text-slate-600">{selectedOrder.delivery.delivery_address}{selectedOrder.delivery.delivery_city ? `, ${selectedOrder.delivery.delivery_city}` : ""}</p><p className="mt-1 text-sm text-slate-500">{selectedOrder.delivery.delivery_phone}</p>{selectedOrder.delivery.delivery_notes && <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-500">Note: {selectedOrder.delivery.delivery_notes}</p>}</div>}
            </section>
            <section><h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900"><Truck className="h-5 w-5 text-emerald-700" />Delivery progress</h2>{selectedOrder.timeline.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Tracking updates will appear here.</p> : <ol className="space-y-0">{selectedOrder.timeline.map((step, index) => <li key={step.key} className="relative flex gap-3 pb-5 last:pb-0"><div className="flex w-7 shrink-0 flex-col items-center"><span className={`z-10 flex h-7 w-7 items-center justify-center rounded-full ${step.state === "upcoming" ? "bg-slate-100 text-slate-400" : "bg-emerald-600 text-white"}`}>{step.state === "upcoming" ? <Clock3 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</span>{index < selectedOrder.timeline.length - 1 && <span className={`absolute top-7 bottom-0 w-px ${step.state === "completed" ? "bg-emerald-300" : "bg-slate-200"}`} />}</div><div className="min-w-0 pb-1"><p className={`text-sm font-semibold ${step.state === "upcoming" ? "text-slate-400" : "text-slate-900"}`}>{step.title}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{step.description}</p>{step.occurred_at && <p className="mt-1 text-xs text-slate-400">{date(step.occurred_at, true)}</p>}</div></li>)}</ol>}</section>
          </div>
        </div>}
      </DialogContent>
    </Dialog>
  </div>;
}

export default function OrdersPage() { return <AuthGuard><OrdersContent /></AuthGuard>; }
