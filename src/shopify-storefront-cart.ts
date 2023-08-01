import { Cart, CartItem, PreorderAttributes } from "./cart";

export type ShopifyStorefrontCartItem = CartItem & {
  id: string;
  quantity: number;
  attributes: { key: string; value: string }[];
  merchandise: {
    id: string;
  };
};

export const ShopifyStorefrontCart: Cart<ShopifyStorefrontCartItem> = {
  hasPreorderAttributes(item: ShopifyStorefrontCartItem): boolean {
    return item.attributes.some(({ key }) => key === "__releaseId");
  },

  addPreorderAttributes(
    item: ShopifyStorefrontCartItem,
    attrs: PreorderAttributes,
  ) {
    return {
      ...item,
      attributes: [
        ...item.attributes,
        { key: "__releaseId", value: attrs.releaseId },
        { key: "Purple Dot Pre-order", value: attrs.displayShipDates },
      ],
    };
  },

  removePreorderAttributes(item: ShopifyStorefrontCartItem) {
    return {
      ...item,
      attributes: item.attributes.filter(
        ({ key }) => key !== "__releaseId" && key !== "Purple Dot Pre-order",
      ),
    };
  },

  async fetchItems() {
    throw new Error(
      "fetchItems() is not implemented for ShopifyStorefrontCart",
    );
  },

  async decrementQuantity(id: string) {
    throw new Error(
      "decrementQuantity() is not implemented for ShopifyStorefrontCart",
    );
  },

  async clear() {
    throw new Error("clear() is not implemented for ShopifyStorefrontCart");
  },

  async navigateToCheckout() {
    throw new Error(
      "navigateToCheckout() is not implemented for ShopifyStorefrontCart",
    );
  },

  async getCartId() {
    throw new Error("getCartId() is not implemented for ShopifyStorefrontCart");
  },

  getCartType() {
    return "storefront";
  },
};
