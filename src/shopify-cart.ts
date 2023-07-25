import cookies from "js-cookie";
import { fetchVariantsPreorderState } from "./api";
import { Cart, CartItem, PreorderAttributes } from "./cart";
import { JSONObject } from "./interceptors";

export type ShopifyAJAXCartItem = CartItem & {
  id?: string;
  quantity?: number;
  properties?: Record<string, string>;
};

export const ShopifyAJAXCart: Cart<ShopifyAJAXCartItem> = {
  hasPreorderAttributes(item: ShopifyAJAXCartItem): boolean {
    return !!item.properties?.["__releaseId"];
  },

  addPreorderAttributes(item: ShopifyAJAXCartItem, attrs: PreorderAttributes) {
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

  removePreorderAttributes(item: ShopifyAJAXCartItem) {
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
    const cartResponse = await fetch("/cart.js");
    const cart = await cartResponse.json();

    const lineItem = cart.items.find(
      (item: { id: number }) => item.id.toString() === id,
    );

    if (lineItem) {
      const updates = {
        [lineItem.id]: lineItem.quantity - 1,
      };

      await fetch("/cart/update.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          updates,
        }),
      });
    }
  },

  async clear() {
    await fetch("/cart/clear.js", { method: "POST" });
  },

  async navigateToCheckout() {
    window.location.href = "/checkout";
  },

  async getCartId() {
    const shopifyCartId = cookies.get("cart");
    return shopifyCartId ?? null;
  },
};

export async function updatePreorderAttributes(
  item: ShopifyAJAXCartItem,
): Promise<ShopifyAJAXCartItem | null> {
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

    return ShopifyAJAXCart.addPreorderAttributes(item, attributes);
  }

  if (ShopifyAJAXCart.hasPreorderAttributes(item)) {
    return ShopifyAJAXCart.removePreorderAttributes(item);
  }

  return null;
}
