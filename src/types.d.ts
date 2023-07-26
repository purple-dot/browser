import type { Cart, CartItem } from "./cart";

export declare global {
  interface Window {
    PurpleDotConfig?: {
      apiKey: string;
      cartAdapter: Cart<CartItem>;
    };

    Shopify?: {
      shop?: string;
      routes?: {
        root?: string;
      };
    };
  }
}
