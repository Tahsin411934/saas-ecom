import { api } from "@/lib/api";
import type { ProductSearchResult } from "@/types/product";

export type ChatTurn = {
  role: "user" | "assistant";
  content: string;
};

export type ChatReply = {
  reply: string;
  products: ProductSearchResult[];
  suggestion?: string | null;
};

export type ChatOrder = {
  order_number: string;
  status: string;
  placed_at: string | null;
  items_count: number;
  grand_total: number;
  currency_code: string;
  tracking_number: string | null;
  eta_at: string | null;
};

type OrderStatusEnvelope = {
  status: "success" | "error";
  message: string;
  data?: { reply: string; orders: ChatOrder[] };
};

type ChatEnvelope = {
  status: "success" | "error";
  message: string;
  data?: ChatReply;
};

export async function sendChatMessage(message: string, history: ChatTurn[]): Promise<ChatReply> {
  const response = await api<ChatEnvelope>("/chat", {
    method: "POST",
    body: JSON.stringify({ message, history: history.slice(-6) }),
    cache: "no-store",
  });

  if (response.status !== "success" || !response.data) {
    throw new Error(response.message || "Chat is temporarily unavailable.");
  }

  return response.data;
}

export async function getChatOrderStatus(orderNumber?: string): Promise<{ reply: string; orders: ChatOrder[] }> {
  const response = await api<OrderStatusEnvelope>("/chat/order-status", {
    method: "POST",
    body: JSON.stringify(orderNumber ? { order_number: orderNumber } : {}),
    cache: "no-store",
  });

  if (response.status !== "success" || !response.data) {
    throw new Error(response.message || "Could not load order status.");
  }

  return response.data;
}
