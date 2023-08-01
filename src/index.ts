import { setConfig } from "./config";
import { injectComponentScripts } from "./web-components";
import { trackEvent, trackPageView } from "./tracking";
import {
  onDOMContentLoaded,
  onLocationChange,
  onPurpleDotEvent,
} from "./custom-events";
import { ShopifyAJAXCart } from "./shopify-ajax-cart";
import type { Cart, CartItem } from "./cart";

export function init(config: { apiKey: string; cartAdapter?: Cart<CartItem> }) {
  setConfig({
    apiKey: config.apiKey,
    cartAdapter: config.cartAdapter ?? ShopifyAJAXCart,
  });

  if (globalThis.window) {
    injectComponentScripts();
  }
}

if (globalThis.window) {
  onDOMContentLoaded(() => trackPageView().catch(() => {}));
  onLocationChange(() => trackPageView().catch(() => {}));

  onPurpleDotEvent("CheckoutLoaded", (detail: object) => {
    trackEvent("checkout_loaded", detail);
  });
  onPurpleDotEvent("PreorderCheckoutStep", (detail: object) => {
    trackEvent("pre_order_checkout_step", detail).catch(() => {});
  });
  onPurpleDotEvent("PreorderCheckoutSubmitted", (detail: object) => {
    trackEvent("pre_order_checkout_submitted", detail).catch(() => {});
  });
  onPurpleDotEvent("PreorderCreated", (detail: object) => {
    trackEvent("pre_order_created", detail).catch(() => {});
  });
}
