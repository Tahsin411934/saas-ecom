/**
 * GTM Data Layer - Central Export
 * Import all tracking functions from here.
 */
export { pushEvent, pushEcommerceEvent } from "./gtm";
export type { GtmEventData } from "./gtm";

export {
  VIEW_ITEM,
  VIEW_ITEM_LIST,
  SELECT_ITEM,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  VIEW_CART,
  BEGIN_CHECKOUT,
  ADD_SHIPPING_INFO,
  ADD_PAYMENT_INFO,
  PURCHASE,
  VIEW_CATEGORY,
  SEARCH,
  VIEW_SEARCH_RESULTS,
  LOGIN,
  SIGN_UP,
  ADD_TO_WISHLIST,
  REMOVE_FROM_WISHLIST,
} from "./events";

export {
  trackViewItem,
  trackAddToCart,
  trackRemoveFromCart,
  trackAddToWishlist,
  trackRemoveFromWishlist,
  trackViewItemList,
  trackSelectItem,
  trackViewCategory,
  trackViewCart,
  trackBeginCheckout,
  trackPurchase,
} from "./ecommerce";
export type {
  TrackViewItemParams,
  TrackAddToCartParams,
  TrackRemoveFromCartParams,
  TrackAddToWishlistParams,
  TrackRemoveFromWishlistParams,
  TrackViewItemListParams,
  TrackSelectItemParams,
  TrackViewCategoryParams,
  TrackViewCartParams,
  TrackBeginCheckoutParams,
  TrackPurchaseParams,
} from "./ecommerce";

export { trackLogin, trackSignUp } from "./auth";
export type { TrackLoginParams, TrackSignUpParams } from "./auth";

export { trackSearch, trackViewSearchResults } from "./search";
export type { TrackSearchParams, TrackViewSearchResultsParams } from "./search";