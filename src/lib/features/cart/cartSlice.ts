import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { normalizeAssetUrl } from "@/lib/asset-url";

export interface CartItem {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  variant_id?: number;
  variant_name?: string;
  variant_option_id?: number;
  quantity: number;
  stock: number;
  /** Product-level delivery charge (৳). Missing values fall back to DEFAULT_DELIVERY_CHARGE. */
  delivery_charge?: number;
}

/**
 * Must stay in sync with Product::DEFAULT_DELIVERY_CHARGE (৳120) on the
 * Laravel backend — used when a cart item has no stored charge (e.g. legacy
 * localStorage carts saved before the delivery-charge feature existed).
 */
export const DEFAULT_DELIVERY_CHARGE = 120;

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  animatingItem: { id: number; name: string; image: string | null } | null;
}

// Load cart from localStorage
function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem("cart_items");
    const items: CartItem[] = saved ? JSON.parse(saved) : [];
    // Rewrite legacy backend hosts (pos.aftsoftandlimited.com) persisted in
    // older cart entries so images keep resolving after the domain migration.
    return items.map((item) => ({
      ...item,
      image: normalizeAssetUrl(item.image) || null,
    }));
  } catch {
    return [];
  }
}

// Save cart to localStorage
function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cart_items", JSON.stringify(items));
  } catch {
    // ignore
  }
}

const initialState: CartState = {
  items: loadCart(),
  isOpen: false,
  animatingItem: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Omit<CartItem, "quantity">>) {
      const existing = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.variant_id === action.payload.variant_id &&
          item.variant_option_id === action.payload.variant_option_id
      );
      if (existing) {
        existing.quantity = Math.min(existing.quantity + 1, 99);
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      saveCart(state.items);
      // Set animating item for fly animation
      state.animatingItem = {
        id: action.payload.id,
        name: action.payload.name,
        image: action.payload.image,
      };
    },
    addToCartWithQuantity(
      state,
      action: PayloadAction<CartItem & { animation?: boolean }>
    ) {
      const existing = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.variant_id === action.payload.variant_id &&
          item.variant_option_id === action.payload.variant_option_id
      );
      if (existing) {
        existing.quantity = Math.min(existing.quantity + action.payload.quantity, 99);
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity });
      }
      saveCart(state.items);
      if (action.payload.animation !== false) {
        state.animatingItem = {
          id: action.payload.id,
          name: action.payload.name,
          image: action.payload.image,
        };
      }
    },
    removeFromCart(state, action: PayloadAction<{ id: number; variant_id?: number; variant_option_id?: number }>) {
      state.items = state.items.filter(
        (item) =>
          !(item.id === action.payload.id && 
            item.variant_id === action.payload.variant_id &&
            item.variant_option_id === action.payload.variant_option_id)
      );
      saveCart(state.items);
    },
    updateQuantity(
      state,
      action: PayloadAction<{ id: number; variant_id?: number; variant_option_id?: number; quantity: number }>
    ) {
      const item = state.items.find(
        (item) =>
          item.id === action.payload.id &&
          item.variant_id === action.payload.variant_id &&
          item.variant_option_id === action.payload.variant_option_id
      );
      if (item) {
        item.quantity = Math.max(1, Math.min(99, action.payload.quantity));
      }
      saveCart(state.items);
    },
    // Refresh per-item delivery charges with the LIVE backend values (matched
    // by variant_id) — used after a cart sync so an admin's delivery-charge
    // change is reflected even for items already sitting in localStorage.
    updateDeliveryCharges(
      state,
      action: PayloadAction<Array<{ variant_id: number; delivery_charge: number }>>
    ) {
      for (const upd of action.payload) {
        const item = state.items.find((i) => i.variant_id === upd.variant_id);
        if (item) {
          item.delivery_charge = upd.delivery_charge;
        }
      }
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      saveCart(state.items);
    },
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      saveCart(state.items);
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
    clearAnimation(state) {
      state.animatingItem = null;
    },
  },
});

export const {
  addToCart,
  addToCartWithQuantity,
  removeFromCart,
  updateQuantity,
  updateDeliveryCharges,
  clearCart,
  setCartItems,
  toggleCart,
  setCartOpen,
  clearAnimation,
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
// Shipping = the highest product delivery charge in the cart, taken ONCE per
// order (one parcel = one charge) — mirrors the backend DeliveryChargeService.
export const selectShippingTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (max, item) => Math.max(max, item.delivery_charge ?? DEFAULT_DELIVERY_CHARGE),
    0
  );
export const selectGrandTotal = (state: { cart: CartState }) =>
  selectCartTotal(state) + selectShippingTotal(state);
export const selectCartOpen = (state: { cart: CartState }) => state.cart.isOpen;
export const selectAnimatingItem = (state: { cart: CartState }) => state.cart.animatingItem;

export default cartSlice.reducer;