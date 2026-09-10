/**
 * GTM Core Library
 * Central function to push events to the GTM dataLayer.
 */

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

export interface GtmEventData {
  [key: string]: unknown;
}

/**
 * Push an event to the GTM dataLayer.
 * Creates the dataLayer if it doesn't exist.
 */
export function pushEvent(eventName: string, eventData: GtmEventData = {}): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventData,
  });
}

/**
 * Push a GA4 ecommerce event to the dataLayer.
 * Follows the GA4 Enhanced Ecommerce spec.
 */
export function pushEcommerceEvent(
  eventName: string,
  ecommerceData: GtmEventData
): void {
  pushEvent(eventName, { ecommerce: ecommerceData });
}