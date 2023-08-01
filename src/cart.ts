import { getConfig } from "./config";

export type ShipDates = {
  earliest: Date;
  latest: Date;
};

export type PreorderAttributes = {
  releaseId: string;
  displayShipDates: string;
};

export type CartItem = { id?: string };

export interface Cart<T extends CartItem> {
  hasPreorderAttributes: (item: T) => boolean;
  addPreorderAttributes: (item: T, attrs: PreorderAttributes) => T;
  removePreorderAttributes: (item: T) => T;

  // Queries
  fetchItems: () => Promise<Required<T>[]>;
  getCartId: () => Promise<string | null>;
  getCartType: () => string;

  // Mutations
  decrementQuantity: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  navigateToCheckout: () => Promise<void>;
}

export async function cartHasPreorderItem() {
  const cart = getCartAdapter();
  const items = await cart.fetchItems();
  return items.some((i) => cart.hasPreorderAttributes(i));
}

export function getCartAdapter(): Cart<CartItem> {
  const cart = getConfig()?.cartAdapter;
  if (!cart) {
    throw new Error("@purple-dot/browser not initialised");
  }
  return cart;
}
