import type { EventForwardingConfig } from "./analytics/config";
import type { PurpleDotAvailability } from "./availability";
import type { Cart, CartItem } from "./cart";

/**
 * Global Purple Dot configuration.
 */
export interface PurpleDotConfig {
  /**
   * The Purple Dot API key for the store.
   */
  apiKey: string;

  /**
   * Optional cart adapter for working with the combined checkout.
   */
  cartAdapter?: Cart<CartItem>;

  /**
   * Optional default hook for checking the in stock availability of a product.
   */
  inStockAvailability?: <I>(
    request: { variantId: string } | { productHandle: string },
    getPreorderState: () => Promise<PurpleDotAvailability | null>,
  ) => Promise<I | false>;

  /**
   * Optional analytics provider configuration.
   * Configure credentials for third-party analytics providers (Google Ads, Facebook Pixel, etc.)
   * to automatically forward Purple Dot events to these platforms.
   */
  analytics?: EventForwardingConfig;
}
let config: PurpleDotConfig | null = null;

export function setConfig(newConfig: PurpleDotConfig) {
  config = newConfig;

  if (globalThis.window) {
    globalThis.window.PurpleDotConfig = newConfig;
  }
}

export function getConfig() {
  return config;
}
