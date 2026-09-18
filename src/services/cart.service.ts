import type { CartResponse } from "@/types/cart";

/** A single order returned by the split-by-store checkout. */
export interface CheckoutOrder {
  id: number;
  order_number: string;
  store_id: number | null;
  subtotal: number;
  shipping_total: number;
  grand_total: number;
  items: Array<{
    product_name: string;
    variant_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
}

/** Shape returned by the /checkout and /checkout/guest endpoints. */
export interface CheckoutResponse {
  status: string;
  message: string;
  /** Legacy single-order field — backend still returns it for one-store carts. */
  order?: {
    id?: number;
    order_number: string;
    store_id?: number | null;
  };
  /** Multi-store carts are split into one order per store (Amazon-style). */
  orders?: CheckoutOrder[];
  order_count?: number;
  total_amount?: number;
  split_by_store?: boolean;
}

/**
 * Place order (checkout) via the internal proxy, which forwards the
 * user's token server-side (see src/lib/proxy.ts).
 */
export async function checkoutApi(data: {
  cart_id: number;
  shipping_address_id?: number;
  billing_address_id?: number;
  notes?: string;
  shipping_method?: string;
  payment_method?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_phone?: string;
  delivery_notes?: string;
}): Promise<CheckoutResponse> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

/**
 * Sync local cart with backend (merge guest cart) via the internal proxy.
 */
export async function syncCartApi(items: Array<{ product_id: number; variant_id?: number; variant_option_id?: number; quantity: number }>): Promise<CartResponse> {
  const res = await fetch("/api/cart/sync", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });
  return res.json();
}

/**
 * Guest checkout — place an order WITHOUT logging in. Sends the local cart
 * items plus the customer's name and delivery details to the public backend
 * endpoint via the internal proxy (see src/app/api/checkout/guest/route.ts).
 */
export async function guestCheckoutApi(data: {
  items: Array<{ product_id: number; variant_id?: number; variant_option_id?: number; quantity: number }>;
  customer_name: string;
  delivery_address: string;
  delivery_city: string;
  delivery_phone: string;
  delivery_notes?: string;
}): Promise<CheckoutResponse> {
  const res = await fetch("/api/checkout/guest", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
}
