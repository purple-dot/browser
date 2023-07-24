import { fetchVariantsPreorderState } from "./api";
import { Cart, CartItem, PreorderAttributes } from "./cart";
import { JSONObject } from "./interceptors";

export type ShopifyCartItem = CartItem & {
  id?: string;
  quantity?: number;
  properties?: Record<string, string>;
};

const ShopifyCart: Cart<ShopifyCartItem> = {
  hasPreorderAttributes(item: ShopifyCartItem): boolean {
    return !!item.properties?.["__releaseId"];
  },

  addPreorderAttributes(item: ShopifyCartItem, attrs: PreorderAttributes) {
    return {
      id: item.id,
      variantId: item.variantId,
      properties: {
        ...item.properties,
        __releaseId: attrs.releaseId,
        "Purple Dot Pre-order": attrs.displayShipDates,
      },
    };
  },

  removePreorderAttributes(item: ShopifyCartItem) {
    return {
      id: item.id,
      variantId: item.variantId,
      properties: Object.fromEntries(
        Object.entries(item.properties ?? {}).filter(
          ([key]) => key !== "__releaseId" && key !== "Purple Dot Pre-order",
        ),
      ),
    };
  },

  async fetchItems() {
    // TODO: Add the locale to the URL
    const response = await fetch("/cart.js");
    const data = await response.json();

    return data.items.map((item: JSONObject) => {
      return {
        id: item.key ?? item.id ?? item.variant_id,
        variantId: item.variant_id,
        properties: item.properties,
      };
    });
  },

  async decrementQuantity(id: string) {
    // See https://github.com/purple-dot/browser/blob/main/src/shopify-cart.ts
    // TODO: Fetch the cart and decrement one of the matching line items
  },

  async clear() {
    await fetch("/cart/clear.js", { method: "POST" });
  },
};

export async function updatePreorderAttributes(
  item: ShopifyCartItem,
): Promise<ShopifyCartItem | null> {
  const variantId = parseFloat(item.variantId);
  const preorderState = await fetchVariantsPreorderState(variantId);

  if (preorderState == null) {
    return null;
  }

  if (preorderState.state === "ON_PREORDER" && preorderState.waitlist) {
    const attributes = {
      releaseId: preorderState.waitlist.id,
      displayShipDates: preorderState.waitlist.display_dispatch_date,
    };

    return ShopifyCart.addPreorderAttributes(item, attributes);
  }

  if (ShopifyCart.hasPreorderAttributes(item)) {
    return ShopifyCart.removePreorderAttributes(item);
  }

  return null;
}

export default ShopifyCart;
