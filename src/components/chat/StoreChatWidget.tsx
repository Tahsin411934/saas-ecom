"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import { ApiError } from "@/lib/api";
import { getChatOrderStatus, sendChatMessage, type ChatOrder, type ChatReply, type ChatTurn } from "@/services/chat.service";
import { settingsService } from "@/services/settings.service";
import type { ProductSearchResult } from "@/types/product";
import { useAppSelector } from "@/lib/hooks";

type ChatMessage = ChatTurn & { id: number; products?: ProductSearchResult[]; details?: string | null; categories?: ChatReply["categories"]; orders?: ChatOrder[]; loginHref?: string; support?: ChatReply["support"] };

function cleanChatText(value: string): string {
  return value.replace(/&#(?:x20|32);|&nbsp;/gi, " ");
}

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
    <Link href={product.url || `/product/${product.slug}`} onClick={onNavigate} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-[var(--color-primary-muted)] hover:shadow-sm">
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {product.main_image ? (
          <Image src={product.main_image} alt={product.name} fill sizes="72px" className="object-cover" />
        ) : <div className="flex h-full items-center justify-center text-[10px] text-slate-400">No image</div>}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-900">{product.name}</p>
        <p className="mt-1 text-xs font-bold text-[var(--color-primary-dark)]">{formatPrice(product.price, product.unit)}</p>
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
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  useEffect(() => {
    let active = true;
    settingsService.getAll().then((settings) => {
      if (active) setWhatsappNumber(settings.data?.whatsapp_number || settings.data?.phone || "");
    }).catch(() => {
      // Keep chat usable if public contact settings are temporarily unavailable.
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, sending]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("open-store-chat", openChat);
    return () => window.removeEventListener("open-store-chat", openChat);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !widgetRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

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
        content: cleanChatText(response.reply),
        products: response.products,
        details: response.details ? cleanChatText(response.details) : null,
        categories: response.categories,
        support: response.support,
      }]);
    } catch (error) {
      const message = error instanceof ApiError && error.status === 429
        ? "একটু পরে আবার চেষ্টা করুন—এই মুহূর্তে অনেকগুলো request এসেছে।"
        : "দুঃখিত, এখন উত্তর দিতে পারছি না। আবার চেষ্টা করুন বা search box ব্যবহার করুন।";
      const digits = whatsappNumber.replace(/\D/g, "");
      const internationalNumber = digits.startsWith("880") ? digits : digits.startsWith("0") ? `88${digits}` : digits;
      const support = internationalNumber ? {
        message: "সহায়তার জন্য WhatsApp-এ আমাদের সাথে যোগাযোগ করুন।",
        whatsapp_url: `https://wa.me/${internationalNumber}?text=${encodeURIComponent("Hello, I need help finding a product from OneHaat.")}`,
        phone: whatsappNumber,
      } : undefined;
      setMessages((current) => [...current, { id: nextId.current++, role: "assistant", content: message, support }]);
    } finally {
      setSending(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void send(draft);
  };

  return (
    <div ref={widgetRef} className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[80] flex flex-col items-end gap-3 md:bottom-6 md:right-6">
      {open && (
        <section role="dialog" aria-modal="true" aria-label="OneHaat shopping assistant" className="flex h-[min(80dvh,44rem)] w-[min(calc(100vw-2rem),26rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 md:h-[min(84dvh,48rem)]">
          <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[var(--color-primary)] px-4 py-4 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20"><Bot className="h-5 w-5" /></span>
              <div><h2 className="text-sm font-semibold tracking-wide">Shopping Assistant</h2><p className="mt-1 text-[11px] text-white/80">Find products or get personal support</p></div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-xl p-2.5 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"><X className="h-5 w-5" /></button>
          </header>

          <div ref={scrollRef} aria-live="polite" aria-busy={sending} className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/90 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[92%] rounded-2xl px-4 py-3 shadow-sm ${message.role === "user" ? "rounded-br-md bg-[var(--color-primary)] text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}>
                  <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                  {message.details && <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{message.details}</p>}
                  {message.loginHref && <Link href={message.loginHref} className="mt-2 inline-flex rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white">Login to view orders</Link>}
                  {message.support && <div className="mt-3 rounded-2xl border border-[var(--color-primary-muted)] bg-[var(--color-primary-soft)] p-3.5"><p className="text-xs leading-5 text-slate-800">{message.support.message}</p><a href={message.support.whatsapp_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"><MessageCircle className="h-4 w-4" />WhatsApp-এ যোগাযোগ করুন · {message.support.phone}</a></div>}
                  {message.products && message.products.length > 0 && <div className="mt-3 space-y-2">{message.products.map((product) => <ProductResultCard key={product.id} product={product} onNavigate={() => setOpen(false)} />)}</div>}
                  {message.categories && message.categories.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{message.categories.map((category) => <Link key={category.id} href={category.url} onClick={() => setOpen(false)} className="rounded-full border border-[var(--color-primary-muted)] bg-[var(--color-primary-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-primary-dark)] transition hover:bg-[var(--color-primary-subtle)]">{category.name}</Link>)}</div>}
                  {message.orders && message.orders.length > 0 && <div className="mt-3 space-y-2">{message.orders.map((order) => <OrderResultCard key={order.order_number} order={order} />)}</div>}
                </div>
              </div>
            ))}
            {messages.length === 1 && !sending && <div className="flex flex-wrap gap-2">{quickPrompts.map((prompt) => <button key={prompt} type="button" onClick={() => void send(prompt)} className="rounded-full border border-[var(--color-primary-muted)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-primary-dark)] transition hover:bg-[var(--color-primary-soft)]">{prompt}</button>)}</div>}
            {sending && <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500 shadow-sm"><LoaderCircle className="h-4 w-4 animate-spin text-[var(--color-primary)]" />খুঁজে দেখছি…</div>}
          </div>

          <form onSubmit={submit} className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-white p-3.5">
            <label htmlFor="store-chat-message" className="sr-only">আপনার message</label>
            <input id="store-chat-message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={600} placeholder="পণ্য বা category লিখুন…" className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10" />
            <button type="submit" disabled={!draft.trim() || sending} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /></button>
          </form>
          <p className="shrink-0 border-t border-slate-100 bg-white px-3 pb-2 pt-1 text-center text-[10px] text-slate-400">পণ্যের তথ্য catalog থেকে আসে · ব্যক্তিগত তথ্য পাঠাবেন না</p>
        </section>
      )}

    </div>
  );
}
