export interface CartItemData {
  id: number;
  product_id: number;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  variant_id?: number;
  variant_option_id?: number;
  variant_name?: string;
  quantity: number;
  stock: number;
  line_total: number;
  /** Product-level delivery charge (৳) returned by the backend my-cart API. */
  delivery_charge?: number;
}

/**
 * Shape of the backend cart APIs (`carts/sync`, `carts/my-cart`):
 * ApiResponse::success() wraps the cart payload in `data`.
 */
export interface CartItemRow {
  id: number;
  cart_id: number;
  variant_id: number;
  variant_option_id?: number | null;
  quantity: number;
  unit_price: number;
  /** Product-level delivery charge (৳) resolved by the backend. */
  delivery_charge?: number;
  /** Owning store (null = platform product) — used for split-shipment warning. */
  store_id?: number | null;
  store_name?: string | null;
}

export interface CartResponse {
  status: string;
  message: string;
  data: {
    id: number;
    items: CartItemRow[];
    total?: number;
    subtotal?: number;
    shipping_total?: number;
    grand_total?: number;
  };
}

export interface AddToCartPayload {
  product_id: number;
  variant_id?: number;
  variant_option_id?: number;
  quantity: number;
}