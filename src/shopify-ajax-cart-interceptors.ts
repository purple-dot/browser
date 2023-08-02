import {
  BodyData,
  JSONObject,
  RequestInterceptor,
  parseFetchRequestBody,
  shopifyUrlStartsWith,
} from "./interceptors";
import {
  ShopifyAJAXCart,
  ShopifyAJAXCartItem,
  updatePreorderAttributes,
} from "./shopify-ajax-cart";
import { trackEvent } from "./tracking";

function shouldIntercept(input: string | URL) {
  return shopifyUrlStartsWith(input, "cart/add");
}

export class ShopifyAJAXCartAddInterceptor extends RequestInterceptor {
  constructor() {
    super(shouldIntercept);

    this.addHandler(onAddToCart);
  }
}

async function onAddToCart([input, init]: [
  input: string | URL,
  init?: RequestInit,
]): Promise<[input: string | URL, init?: RequestInit]> {
  if (!init || !init?.body) {
    return [input, init];
  }

  if (init.method?.toUpperCase() === "POST" || init.body) {
    let requestBody: BodyData;
    try {
      requestBody = parseFetchRequestBody(init);
    } catch (err) {
      // Unsupported body type, oh dear.
      return [input, init];
    }

    // Convert the Shopify add to cart request to our Cart API format.
    const newItems = getItemsFromRequest(requestBody);

    // Keep track of if we find anything that needs changing so we can avoid changing things that don't need it.
    let changed = false;

    const updatedItems: ShopifyAJAXCartItem[] = [];
    for (const item of newItems) {
      const updatedItem = await updatePreorderAttributes(item);
      if (updatedItem) {
        updatedItems.push(updatedItem);
        changed = true;
      } else {
        updatedItems.push(item);
      }
    }

    for (const item of updatedItems) {
      trackEvent("integration.added_to_cart", {
        variant_id: item.variantId,
        release_id: item.properties?.["__releaseId"] ?? null,
      }).catch(() => {});
    }

    // If we didn't alter anything, just return the original data.
    if (!changed) {
      return [input, init];
    }

    // Try to convert it back to the same kind of request we started with.
    const headers = new Headers(init.headers);
    const contentType = headers.get("content-type")?.toLowerCase();

    if (contentType === "application/json") {
      const newBody = shopifyAJAXAddToCart(updatedItems);

      // Original request was only for a single item, so we also return a single item.
      if ("id" in requestBody) {
        return [input, { ...init, body: JSON.stringify(newBody.items[0]) }];
      }

      return [input, { ...init, body: JSON.stringify(newBody) }];
    }

    if (newItems.length > 1) {
      console.error(
        "Purple Dot: Only a single item can be added to the cart at a time when using /cart/add",
        { request: [input, init], newItems },
      );
      return [input, init];
    }

    const newBody = shopifyFormAddToCart(updatedItems);
    return [input, { ...init, body: newBody.toString() }];
  }

  if (init.method?.toUpperCase() === "GET") {
    const newURL = new URL(input);

    // Convert the Shopify add to cart request to our Cart API format.
    const newItems = getItemsFromRequest(newURL.searchParams);
    if (newItems.length > 1) {
      console.error(
        "Purple Dot: Only a single item can be added to the cart at a time when using GET.",
        { request: [input, init], newItems },
      );
      return [input, init];
    }

    const updatedItem = await updatePreorderAttributes(newItems[0]);
    if (updatedItem) {
      applyURLEncodedAddToCart(updatedItem, newURL.searchParams);
    }

    return [newURL, init];
  }

  return [input, init];
}

function getItemsFromRequest(
  data: FormData | URLSearchParams | JSONObject,
): ShopifyAJAXCartItem[] {
  // Fix the documented /cart/add.js API
  // https://shopify.dev/api/ajax/reference/cart

  if ("items" in data) {
    const pdAddToCartRequests: ShopifyAJAXCartItem[] = [];

    const items = data["items"];

    if (Array.isArray(items)) {
      for (const item of items) {
        const newItem: ShopifyAJAXCartItem = {
          id: item.id,
          variantId: `${item.id}`,
          properties: item.properties,
        };

        if (item.quantity || item.quantity === 0) {
          newItem.quantity = parseFloat(item.quantity);
        }

        pdAddToCartRequests.push(newItem);
      }
    }

    return pdAddToCartRequests;
  }

  // Fix the form style /cart/add API
  const variantId = getValue(data, "id");
  if (!variantId) {
    return [];
  }

  const quantityValue = getValue(data, "quantity");
  const quantity = parseFloat(quantityValue ?? "1");

  const properties = extractAddToCartProperties(data);

  const pdRequests: ShopifyAJAXCartItem[] = [
    {
      id: variantId,
      variantId,
      quantity,
      properties,
    },
  ];

  return pdRequests;
}

function getValue(
  data: FormData | URLSearchParams | JSONObject,
  key: string,
): string | undefined {
  if (data instanceof FormData || data instanceof URLSearchParams) {
    return data.get(key)?.toString();
  } else if (key in data && data[key]) {
    return data[key]?.toString() as string;
  }
}

function shopifyAJAXAddToCart(
  request: ShopifyAJAXCartItem | ShopifyAJAXCartItem[],
) {
  const rawItems = Array.isArray(request) ? request : [request];

  const items = rawItems.map((item) => {
    return {
      id: item.variantId,
      quantity: item.quantity,
      properties: item.properties,
    };
  });

  return { items };
}

function shopifyFormAddToCart(request: ShopifyAJAXCartItem[]) {
  // Convert to a /cart/add request
  const newBody = new URLSearchParams();

  for (const item of request) {
    if (item.variantId) {
      newBody.append("id", item.variantId.toString());
    }

    if (item.quantity) {
      newBody.append("quantity", item.quantity.toString());
    }

    for (const [key, value] of Object.entries(item.properties ?? {})) {
      newBody.append(`properties[${key}]`, value);
    }
  }

  return newBody;
}

function applyURLEncodedAddToCart(
  item: ShopifyAJAXCartItem,
  target: URLSearchParams,
) {
  const newProperties = item.properties;
  const newKeys = new Set(Object.keys(newProperties ?? {}));

  // Diff the keys to see if we need to do anything
  const existingKeys = new Set<string>();
  target.forEach((_value, key) => {
    existingKeys.add(key);
  });

  const keysToRemove = new Set<string>();
  for (const key of existingKeys) {
    if (!newKeys.has(key)) {
      keysToRemove.add(key);
    }
  }

  // Add the new properties
  for (const [key, value] of Object.entries(newProperties ?? {})) {
    target.set(`properties[${key}]`, value);
  }

  // Disable the checkout redirect if this is a preorder
  if (new ShopifyAJAXCart().hasPreorderAttributes(item)) {
    target.delete("checkout");
  }
}

function extractAddToCartProperties(
  data: FormData | URLSearchParams | JSONObject,
) {
  if (data instanceof FormData || data instanceof URLSearchParams) {
    const properties: Record<string, string> = {};

    data.forEach((value, key) => {
      const keyMatch = key.match(/.*\[(.*)\]/);

      if (keyMatch && keyMatch.length > 0) {
        const propKey = keyMatch[1];
        properties[propKey] = value as string;
      }
    });

    return properties;
  }

  return (data.properties ?? {}) as Record<string, string>;
}

export function start() {
  new ShopifyAJAXCartAddInterceptor();
}
