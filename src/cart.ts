export type ShipDates = {
  earliest: Date;
  latest: Date;
};

export type PreorderAttributes = {
  releaseId: string;
  displayShipDates: string;
};

export type CartItem = { variantId: string };

export interface Cart<T extends CartItem> {
  hasPreorderAttributes: (item: T) => boolean;
  addPreorderAttributes: (item: T, attrs: PreorderAttributes) => T;
  removePreorderAttributes: (item: T) => T;

  // Queries
  fetchItems: () => Promise<Required<T>[]>;
  getCartId: () => Promise<string | null>;

  // Mutations
  decrementQuantity: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  navigateToCheckout: () => Promise<void>;
}

export async function cartHasPreorderItem(cart: Cart<CartItem>) {
  const items = await cart.fetchItems();
  return items.some((i) => cart.hasPreorderAttributes(i));
}
