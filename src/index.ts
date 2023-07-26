import { injectComponentScripts } from "./web-components";
import { trackEvent, trackPageView } from "./tracking";
import {
  onDOMContentLoaded,
  onLocationChange,
  onPurpleDotEvent,
} from "./custom-events";

export interface PurpleDotConfig {
  apiKey: string;
}

export function init(config: PurpleDotConfig) {
  window.PurpleDotConfig = {
    apiKey: config.apiKey,
  };

  injectComponentScripts();
}

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
