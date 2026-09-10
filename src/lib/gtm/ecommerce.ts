/**
 * GTM Ecommerce Events
 * GA4 Enhanced Ecommerce tracking functions.
 */
import { pushEcommerceEvent } from "./gtm";
import {
  VIEW_ITEM,
  VIEW_ITEM_LIST,
  SELECT_ITEM,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  VIEW_CART,
  BEGIN_CHECKOUT,
  PURCHASE,
  ADD_TO_WISHLIST,
  REMOVE_FROM_WISHLIST,
  VIEW_CATEGORY,
} from "./events";

export interface GtmItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
  item_brand?: string;
  item_variant?: string;
  item_list_name?: string;
  index?: number;
  image_url?: string;
}

export interface TrackViewItemParams {
  productId: number | string;
  productName: string;
  price: number;
  category?: string;
  brand?: string;
  imageUrl?: string;
}

export function trackViewItem(params: TrackViewItemParams): void {
  const item: GtmItem = {
    item_id: String(params.productId),
    item_name: params.productName,
    price: params.price,
    ...(params.category ? { item_category: params.category } : {}),
    ...(params.brand ? { item_brand: params.brand } : {}),
    ...(params.imageUrl ? { image_url: params.imageUrl } : {}),
  };

  pushEcommerceEvent(VIEW_ITEM, {
    currency: "BDT",
    value: params.price,
    items: [item],
  });
}

export interface TrackAddToCartParams {
  productId: number | string;
  productName: string;
  price: number;
  quantity: number;
  variant?: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
}

export function trackAddToCart(params: TrackAddToCartParams): void {
  const item: GtmItem = {
    item_id: String(params.productId),
    item_name: params.productName,
    price: params.price,
    quantity: params.quantity,
    ...(params.variant ? { item_variant: params.variant } : {}),
    ...(params.category ? { item_category: params.category } : {}),
    ...(params.brand ? { item_brand: params.brand } : {}),
    ...(params.imageUrl ? { image_url: params.imageUrl } : {}),
  };

  pushEcommerceEvent(ADD_TO_CART, {
    currency: "BDT",
    value: params.price * params.quantity,
    items: [item],
  });
}

export interface TrackRemoveFromCartParams {
  productId: number | string;
  productName: string;
  price: number;
  quantity: number;
  variant?: string;
  category?: string;
}

export function trackRemoveFromCart(params: TrackRemoveFromCartParams): void {
  const item: GtmItem = {
    item_id: String(params.productId),
    item_name: params.productName,
    price: params.price,
    quantity: params.quantity,
    ...(params.variant ? { item_variant: params.variant } : {}),
    ...(params.category ? { item_category: params.category } : {}),
  };

  pushEcommerceEvent(REMOVE_FROM_CART, {
    currency: "BDT",
    value: params.price * params.quantity,
    items: [item],
  });
}

export interface TrackAddToWishlistParams {
  productId: number | string;
  productName: string;
  price: number;
  category?: string;
  brand?: string;
  imageUrl?: string;
}

export function trackAddToWishlist(params: TrackAddToWishlistParams): void {
  const item: GtmItem = {
    item_id: String(params.productId),
    item_name: params.productName,
    price: params.price,
    ...(params.category ? { item_category: params.category } : {}),
    ...(params.brand ? { item_brand: params.brand } : {}),
    ...(params.imageUrl ? { image_url: params.imageUrl } : {}),
  };

  pushEcommerceEvent(ADD_TO_WISHLIST, {
    currency: "BDT",
    value: params.price,
    items: [item],
  });
}

export interface TrackRemoveFromWishlistParams {
  productId: number | string;
  productName: string;
  price: number;
}

export function trackRemoveFromWishlist(params: TrackRemoveFromWishlistParams): void {
  const item: GtmItem = {
    item_id: String(params.productId),
    item_name: params.productName,
    price: params.price,
  };

  pushEcommerceEvent(REMOVE_FROM_WISHLIST, {
    currency: "BDT",
    value: params.price,
    items: [item],
  });
}

export interface TrackViewItemListParams {
  listName: string;
  items: Array<{
    productId: number | string;
    productName: string;
    price: number;
    category?: string;
    brand?: string;
    index?: number;
  }>;
}

export function trackViewItemList(params: TrackViewItemListParams): void {
  const items: GtmItem[] = params.items.map((item, i) => ({
    item_id: String(item.productId),
    item_name: item.productName,
    price: item.price,
    item_list_name: params.listName,
    index: item.index ?? i,
    ...(item.category ? { item_category: item.category } : {}),
    ...(item.brand ? { item_brand: item.brand } : {}),
  }));

  pushEcommerceEvent(VIEW_ITEM_LIST, {
    item_list_name: params.listName,
    items,
  });
}

export interface TrackSelectItemParams {
  productId: number | string;
  productName: string;
  price: number;
  listName?: string;
  category?: string;
  brand?: string;
  index?: number;
}

export function trackSelectItem(params: TrackSelectItemParams): void {
  const item: GtmItem = {
    item_id: String(params.productId),
    item_name: params.productName,
    price: params.price,
    ...(params.listName ? { item_list_name: params.listName } : {}),
    ...(params.category ? { item_category: params.category } : {}),
    ...(params.brand ? { item_brand: params.brand } : {}),
    ...(params.index !== undefined ? { index: params.index } : {}),
  };

  pushEcommerceEvent(SELECT_ITEM, {
    items: [item],
  });
}

export interface TrackViewCategoryParams {
  categoryId: number | string;
  categoryName: string;
  categorySlug: string;
}

export function trackViewCategory(params: TrackViewCategoryParams): void {
  pushEcommerceEvent(VIEW_CATEGORY, {
    category_id: String(params.categoryId),
    category_name: params.categoryName,
    category_slug: params.categorySlug,
  });
}

export interface TrackViewCartParams {
  items: Array<{
    productId: number | string;
    productName: string;
    price: number;
    quantity: number;
    variant?: string;
    category?: string;
  }>;
  totalValue: number;
  currency?: string;
}

export function trackViewCart(params: TrackViewCartParams): void {
  const items: GtmItem[] = params.items.map((item) => ({
    item_id: String(item.productId),
    item_name: item.productName,
    price: item.price,
    quantity: item.quantity,
    ...(item.variant ? { item_variant: item.variant } : {}),
    ...(item.category ? { item_category: item.category } : {}),
  }));

  pushEcommerceEvent(VIEW_CART, {
    currency: params.currency || "BDT",
    value: params.totalValue,
    items,
  });
}

export interface TrackBeginCheckoutParams {
  items: Array<{
    productId: number | string;
    productName: string;
    price: number;
    quantity: number;
    variant?: string;
    category?: string;
  }>;
  totalValue: number;
  currency?: string;
}

export function trackBeginCheckout(params: TrackBeginCheckoutParams): void {
  const items: GtmItem[] = params.items.map((item) => ({
    item_id: String(item.productId),
    item_name: item.productName,
    price: item.price,
    quantity: item.quantity,
    ...(item.variant ? { item_variant: item.variant } : {}),
    ...(item.category ? { item_category: item.category } : {}),
  }));

  pushEcommerceEvent(BEGIN_CHECKOUT, {
    currency: params.currency || "BDT",
    value: params.totalValue,
    items,
  });
}

export interface TrackPurchaseParams {
  orderId: string;
  transactionId: string;
  items: Array<{
    productId: number | string;
    productName: string;
    price: number;
    quantity: number;
    variant?: string;
    category?: string;
  }>;
  totalValue: number;
  shipping?: number;
  tax?: number;
  currency?: string;
}

export function trackPurchase(params: TrackPurchaseParams): void {
  const items: GtmItem[] = params.items.map((item) => ({
    item_id: String(item.productId),
    item_name: item.productName,
    price: item.price,
    quantity: item.quantity,
    ...(item.variant ? { item_variant: item.variant } : {}),
    ...(item.category ? { item_category: item.category } : {}),
  }));

  pushEcommerceEvent(PURCHASE, {
    transaction_id: params.transactionId,
    order_id: params.orderId,
    currency: params.currency || "BDT",
    value: params.totalValue,
    ...(params.shipping !== undefined ? { shipping: params.shipping } : {}),
    ...(params.tax !== undefined ? { tax: params.tax } : {}),
    items,
  });
}