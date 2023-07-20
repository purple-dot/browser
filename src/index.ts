import cookies from "js-cookie";
import { injectComponentScripts } from "./web-components";
import { trackPageView } from "./tracking";
import { onDOMContentLoaded, onLocationChange } from "./custom-events";
import { Checkout } from "./checkout";

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
    const checkout = new Checkout(
      HOST_URL,
      window.PurpleDotConfig?.apiKey as string,
    );

    checkout.mount({ id: cartId });
  },
};

onDOMContentLoaded(() => trackPageView().catch(() => {}));
onLocationChange(() => trackPageView().catch(() => {}));
