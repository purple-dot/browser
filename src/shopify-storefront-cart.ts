import { Cart, CartItem, PreorderAttributes } from "./cart";

export interface ShopifyStorefrontCartItem extends CartItem {
  quantity?: number;
  attributes?: { key: string; value: string }[];
  merchandise?: {
    id: string;
  };
}

export class ShopifyStorefrontCart implements Cart<ShopifyStorefrontCartItem> {
  constructor(private origin: string, private accessToken: string) {}

  hasPreorderAttributes(item: ShopifyStorefrontCartItem): boolean {
    return item.attributes?.some(({ key }) => key === "__releaseId") ?? false;
  }

  addPreorderAttributes(
    item: ShopifyStorefrontCartItem,
    attrs: PreorderAttributes,
  ) {
    return {
      ...item,
      attributes: [
        ...(item.attributes ?? []),
        { key: "__releaseId", value: attrs.releaseId },
        { key: "Purple Dot Pre-order", value: attrs.displayShipDates },
      ],
    };
  }

  removePreorderAttributes(item: ShopifyStorefrontCartItem) {
    return {
      ...item,
      attributes: item.attributes?.filter(
        ({ key }) => key !== "__releaseId" && key !== "Purple Dot Pre-order",
      ),
    };
  }

  async fetchItems(
    cartId?: string,
  ): Promise<Required<ShopifyStorefrontCartItem>[]> {
    const body = await this.graphql({
      query: `query cart($cartId: ID!) {
        cart(id: $cartId) {
          id
          lines(first: 99) {
            edges {
              node {
                id
                quantity
                attributes { key value }
                merchandise {
                  ... on ProductVariant {
                    id
                  }
                }
              }
            }
          }
        }
      }`,
      variables: {
        cartId,
      },
    });
    // rome-ignore lint/suspicious/noExplicitAny: any is the right type here
    return (body as any).data.cart.lines.edges.map(
      // rome-ignore lint/suspicious/noExplicitAny: any is the right type here
      ({ node }: { node: any }) => node,
    );
  }

  async decrementQuantity(lineId: string, cartId?: string) {
    const items = await this.fetchItems(cartId);
    const quantity = items.find((item) => item.id === lineId)?.quantity ?? 1;

    const res = await this.graphql({
      query: `
        mutation cartLinesRemove($cartId: ID!, $line: CartLineUpdateInput!) {
          cartLinesUpdate(
          cartId: $cartId,
          lines: [$line]
        ) {
          cart {
            id
            lines(first: 99) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }`,
      variables: {
        cartId,
        line: {
          id: lineId,
          quantity: quantity - 1,
        },
      },
    });
  }

  async clear(cartId?: string) {
    const items = await this.fetchItems(cartId);
    const lineIds = items.map((item) => item.id);
    await this.graphql({
      query: `
        mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]) {
          cartLinesRemove(
            cartId: $cartId,
            lineIds: $lineIds
          ) {
            cart {
            id
            lines(first: 99) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }`,
      variables: {
        cartId,
        lineIds,
      },
    });
  }

  async navigateToCheckout(cartId?: string) {
    const body = await this.graphql({
      query: `query cart($cartId: ID!) {
        cart(id: $cartId) {
          id
          checkoutUrl
        }
      }`,
      variables: {
        cartId,
      },
    });
    // rome-ignore lint/suspicious/noExplicitAny: any is the right type here
    window.location.href = (body as any).data.cart.checkoutUrl;
  }

  async getCartId(): Promise<string> {
    throw new Error("getCartId() is not implemented for ShopifyStorefrontCart");
  }

  getCartType() {
    return "storefront";
  }

  private async graphql(body: unknown) {
    const res = await fetch(`https://${this.origin}/api/2023-07/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": this.accessToken,
      },
      body: JSON.stringify(body),
    });
    return await res.json();
  }
}
