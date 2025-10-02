import { type EventForwarder, setupAnalytics } from "./analytics";
import { type PurpleDotConfig, setConfig } from "./config";
import {
  onDOMContentLoaded,
  onLocationChange,
  onPurpleDotEvent,
} from "./custom-events";
import { ShopifyAJAXCart } from "./shopify-ajax-cart";
import { trackEvent, trackPageView } from "./tracking";
import { injectComponentScripts } from "./web-components";

let eventForwarder: EventForwarder | null = null;

export function init(config: PurpleDotConfig) {
  setConfig({
    apiKey: config.apiKey,
    cartAdapter: config.cartAdapter ?? new ShopifyAJAXCart(),
    analytics: config.analytics,
  });

  if (config.analytics) {
    eventForwarder = setupAnalytics(config.analytics);
  }

  if (globalThis.window) {
    injectComponentScripts();
  }
}

if (globalThis.window) {
  onDOMContentLoaded(() => trackPageView().catch(() => { }));
  onLocationChange(() => trackPageView().catch(() => { }));

  onPurpleDotEvent("CheckoutLoaded", (detail) => {
    trackEvent("checkout_loaded", detail);
    eventForwarder?.track("CheckoutLoaded", detail);
  });

  onPurpleDotEvent("PreorderCheckoutStep", (detail) => {
    trackEvent("pre_order_checkout_step", detail).catch(() => { });
    eventForwarder?.track("PreorderCheckoutStep", detail);
  });

  onPurpleDotEvent("PreorderCheckoutSubmitted", (detail) => {
    trackEvent("pre_order_checkout_submitted", detail).catch(() => { });
    eventForwarder?.track("PreorderCheckoutSubmitted", detail);
  });

  onPurpleDotEvent("PreorderCreated", (detail) => {
    trackEvent("pre_order_created", detail).catch(() => { });
    eventForwarder?.track("PreorderCreated", detail);
  });

  onPurpleDotEvent("OrderCreated", (detail) => {
    eventForwarder?.track("OrderCreated", detail);
  });

  onPurpleDotEvent("PreorderCancelled", (detail) => {
    eventForwarder?.track("PreorderCancelled", detail);
  });

  onPurpleDotEvent("AddToCart", (detail) => {
    eventForwarder?.track("AddToCart", detail);
  });
}
