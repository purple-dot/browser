import cookies from 'js-cookie';
import { injectComponentScripts } from "./web-components";
import * as api from "./api";
import { trackPageView } from "./tracking";
import { Checkout } from "./checkout";

const HOST_URL = 'https://www.purpledotprice.com';

export interface PurpleDotConfig {
  apiKey: string;
}

export function init(config: PurpleDotConfig) {
  window.PurpleDotConfig = {
    apiKey: config.apiKey,
  };

  injectComponentScripts();

  // Check the if we are on the cart page
}

export const cart = {
  getShopifyAJAXCartID() {
    const shopifyCartId = cookies.get('cart')
    return shopifyCartId;
  }
} 

export const checkout = {
  open({ cartId }: { cartId: string; currency: string }) {
    const checkout = new Checkout(
      HOST_URL,
      window.PurpleDotConfig?.apiKey as string,
    );

    checkout.mount({ id: cartId });
  }
}

function onDOMContentLoaded(cb: () => {}) {
  if (document.readyState === "loading") {
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", cb);
  } else {
    // `DOMContentLoaded` has already fired
    cb();
  }
}

onDOMContentLoaded(() => trackPageView().catch(() => {}));

export { api };
