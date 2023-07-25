import { injectComponentScripts } from "./web-components";
import { trackPageView } from "./tracking";
import { onDOMContentLoaded, onLocationChange } from "./custom-events";
import * as checkout from "./checkout";
import * as cart from "./cart";
import * as api from "./api";
import { ShopifyAJAXCart } from "./shopify-cart";
import * as ShopifyAJAXCartInterceptors from "./interceptors";

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

export { cart, checkout, api, ShopifyAJAXCart, ShopifyAJAXCartInterceptors };
