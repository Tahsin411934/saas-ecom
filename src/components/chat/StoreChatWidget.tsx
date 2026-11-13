"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bot, LoaderCircle, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { ApiError } from "@/lib/api";
import { getChatOrderStatus, sendChatMessage, type ChatOrder, type ChatReply, type ChatTurn } from "@/services/chat.service";
import type { ProductSearchResult } from "@/types/product";
import { useAppSelector } from "@/lib/hooks";

type ChatMessage = ChatTurn & { id: number; products?: ProductSearchResult[]; details?: string | null; categories?: ChatReply["categories"]; orders?: ChatOrder[]; loginHref?: string; support?: ChatReply["support"] };

const welcomeMessage = "হ্যালো! কী ধরনের পণ্য খুঁজছেন? পণ্যের নাম বা category লিখুন—আমি catalog থেকে খুঁজে দিচ্ছি।";
const quickPrompts = ["সব jewellery দেখাও", "চুড়ি খুঁজে দাও", "শাড়ি দেখাও"];

function formatPrice(value: number | null | undefined, unit?: ProductSearchResult["unit"]) {
  if (value == null) return "দাম জানতে যোগাযোগ করুন";
  const price = `৳${Number(value).toLocaleString("en-BD")}`;
  const unitLabel = unit?.short_name || unit?.name;
  return unitLabel ? `${price} / ${unitLabel}` : price;
}

function ProductResultCard({ product, onNavigate }: { product: ProductSearchResult; onNavigate: () => void }) {
  return (
    <Link href={product.url || `/product/${product.slug}`} onClick={onNavigate} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-emerald-300 hover:shadow-sm">
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {product.main_image ? (
          <Image src={product.main_image} alt={product.name} fill sizes="72px" className="object-cover" />
        ) : <div className="flex h-full items-center justify-center text-[10px] text-slate-400">No image</div>}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-900">{product.name}</p>
        <p className="mt-1 text-xs font-bold text-emerald-700">{formatPrice(product.price, product.unit)}</p>
        {(product.available_colors?.length || product.available_sizes?.length) ? (
          <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">
            {[product.available_colors?.length ? `রং: ${product.available_colors.join(", ")}` : "", product.available_sizes?.length ? `সাইজ: ${product.available_sizes.join(", ")}` : ""].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function OrderResultCard({ order }: { order: ChatOrder }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-900">{order.order_number}</p><p className="mt-1 text-[10px] text-slate-500">{order.items_count} item{order.items_count === 1 ? "" : "s"} · ৳{Number(order.grand_total).toLocaleString("en-BD")}</p></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold capitalize text-emerald-800">{order.status.replaceAll("_", " ")}</span></div>
      {order.tracking_number && <p className="mt-2 text-[10px] text-slate-600">Tracking: {order.tracking_number}</p>}
      {order.eta_at && <p className="mt-1 text-[10px] text-slate-600">Estimated delivery: {new Date(order.eta_at).toLocaleDateString("en-BD", { dateStyle: "medium" })}</p>}
    </div>
  );
}

export default function StoreChatWidget() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, role: "assistant", content: welcomeMessage },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, sending]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("open-store-chat", openChat);
    return () => window.removeEventListener("open-store-chat", openChat);
  }, []);

  const send = async (rawText: string) => {
    const text = rawText.trim();
    if (!text || sending) return;

    const userMessage: ChatMessage = { id: nextId.current++, role: "user", content: text };
    const previousMessages = messages;
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setSending(true);

    try {
      const orderNumber = text.match(/\bORD-[A-Z0-9]+\b/i)?.[0];
      const isOrderStatusRequest = Boolean(orderNumber) || /(order status|my order|track(ing)?|where (is|are) my order|where('?s)? my order|অর্ডার.*(কোথ|স্ট্যাটাস|অবস্থা)|আমার অর্ডার|অর্ডার নম্বর|ট্র্যাক)/iu.test(text);

      if (isOrderStatusRequest) {
        if (!isAuthenticated) {
          setMessages((current) => [...current, {
            id: nextId.current++,
            role: "assistant",
            content: "Order status দেখতে account-এ login করতে হবে।",
            loginHref: "/login?redirect=%2Forders",
          }]);
          return;
        }

        const response = await getChatOrderStatus(orderNumber);
        setMessages((current) => [...current, {
          id: nextId.current++,
          role: "assistant",
          content: response.reply,
          orders: response.orders,
        }]);
        return;
      }

      const response = await sendChatMessage(text, previousMessages.slice(-6));
      setMessages((current) => [...current, {
        id: nextId.current++,
        role: "assistant",
        content: response.reply,
        products: response.products,
        details: response.details,
        categories: response.categories,
        support: response.support,
      }]);
    } catch (error) {
      const message = error instanceof ApiError && error.status === 429
        ? "একটু পরে আবার চেষ্টা করুন—এই মুহূর্তে অনেকগুলো request এসেছে।"
        : "দুঃখিত, এখন উত্তর দিতে পারছি না। আবার চেষ্টা করুন বা search box ব্যবহার করুন।";
      setMessages((current) => [...current, { id: nextId.current++, role: "assistant", content: message }]);
    } finally {
      setSending(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send(draft);
  };

  return (
    <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[80] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open && (
        <section aria-label="OneHaat shopping assistant" className="flex h-[min(68dvh,36rem)] w-[min(calc(100vw-2rem),24rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/15 md:h-[min(74dvh,38rem)]">
          <header className="flex items-center justify-between bg-[var(--color-primary)] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><Bot className="h-5 w-5" /></span>
              <div><h2 className="text-sm font-semibold">Shopping Assistant</h2><p className="mt-0.5 text-[11px] text-white/80">পণ্য খুঁজে দিতে প্রস্তুত</p></div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-lg p-2 transition hover:bg-white/10"><X className="h-5 w-5" /></button>
          </header>

          <div ref={scrollRef} aria-live="polite" className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-3.5">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 ${message.role === "user" ? "rounded-br-md bg-[var(--color-primary)] text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}>
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                  {message.details && <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{message.details}</p>}
                  {message.loginHref && <Link href={message.loginHref} className="mt-2 inline-flex rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white">Login to view orders</Link>}
                  {message.support && <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3"><p className="text-xs leading-5 text-emerald-950">{message.support.message}</p><a href={message.support.whatsapp_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"><MessageCircle className="h-4 w-4" />WhatsApp-এ যোগাযোগ · {message.support.phone}</a></div>}
                  {message.products && message.products.length > 0 && <div className="mt-3 space-y-2">{message.products.map((product) => <ProductResultCard key={product.id} product={product} onNavigate={() => setOpen(false)} />)}</div>}
                  {message.categories && message.categories.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{message.categories.map((category) => <Link key={category.id} href={category.url} onClick={() => setOpen(false)} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100">{category.name}</Link>)}</div>}
                  {message.orders && message.orders.length > 0 && <div className="mt-3 space-y-2">{message.orders.map((order) => <OrderResultCard key={order.order_number} order={order} />)}</div>}
                </div>
              </div>
            ))}
            {messages.length === 1 && !sending && <div className="flex flex-wrap gap-2">{quickPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => void send(prompt)} className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-50">{prompt}</button>)}</div>}
            {sending && <div className="flex items-center gap-2 text-xs text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />খুঁজে দেখছি…</div>}
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
            <label htmlFor="store-chat-message" className="sr-only">আপনার message</label>
            <input id="store-chat-message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={600} placeholder="পণ্য বা category লিখুন…" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10" />
            <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /></button>
          </form>
          <p className="border-t border-slate-100 bg-white px-3 pb-2 text-center text-[10px] text-slate-400">পণ্যের তথ্য catalog থেকে আসে · ব্যক্তিগত তথ্য পাঠাবেন না</p>
        </section>
      )}

      {!open && <button type="button" onClick={() => setOpen(true)} aria-label="Open shopping assistant" aria-expanded={false} className="flex h-14 items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:shadow-xl">
        <span className="relative"><MessageCircle className="h-5 w-5" /><Sparkles className="absolute -right-1 -top-1 h-3 w-3 fill-white" /></span><span className="text-sm font-semibold">Ask us</span>
      </button>}
    </div>
  );
}
