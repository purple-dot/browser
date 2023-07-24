import cookies from "js-cookie";
import { injectComponentScripts } from "./web-components";
import { trackPageView } from "./tracking";
import { onDOMContentLoaded, onLocationChange } from "./custom-events";

const HOST_URL = "https://www.purpledotprice.com";

export interface PurpleDotConfig {
  apiKey: string;
}

export function init(config: PurpleDotConfig) {
  window.PurpleDotConfig = {
    apiKey: config.apiKey,
  };

  injectComponentScripts();
}

export const cart = {
  getShopifyAJAXCartID() {
    const shopifyCartId = cookies.get("cart");
    return shopifyCartId;
  },
};

export const checkout = {
  open({ cartId }: { cartId: string; currency: string }) {
    const element = document.createElement("purple-dot-checkout");
    document.body.appendChild(element);

    // @ts-ignore
    element.open({ cartId });
  },
};

onDOMContentLoaded(() => trackPageView().catch(() => {}));
onLocationChange(() => trackPageView().catch(() => {}));
