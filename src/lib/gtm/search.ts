/**
 * GTM Search Events
 * Search and search results tracking.
 */
import { pushEvent, pushEcommerceEvent } from "./gtm";
import { SEARCH, VIEW_SEARCH_RESULTS } from "./events";

export interface TrackSearchParams {
  searchTerm: string;
}

export function trackSearch(params: TrackSearchParams): void {
  pushEvent(SEARCH, {
    search_term: params.searchTerm,
  });
}

export interface TrackViewSearchResultsParams {
  searchTerm: string;
  resultsCount: number;
  items?: Array<{
    productId: number | string;
    productName: string;
    price: number;
    category?: string;
    brand?: string;
  }>;
}

export function trackViewSearchResults(params: TrackViewSearchResultsParams): void {
  const items = (params.items || []).map((item) => ({
    item_id: String(item.productId),
    item_name: item.productName,
    price: item.price,
    ...(item.category ? { item_category: item.category } : {}),
    ...(item.brand ? { item_brand: item.brand } : {}),
  }));

  pushEcommerceEvent(VIEW_SEARCH_RESULTS, {
    search_term: params.searchTerm,
    results_count: params.resultsCount,
    items,
  });
}