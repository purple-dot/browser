import * as PurpleDotMain from "../../src/index";
import * as checkout from "../../src/checkout";
import { ShopifyAJAXCart } from "../../src/shopify-cart";

const PurpleDot = {
  ...PurpleDotMain,
  checkout,
  ShopifyAJAXCart,
};

declare global {
  interface Window {
    PurpleDot: typeof PurpleDot;
  }
}

window.PurpleDot = PurpleDot;
