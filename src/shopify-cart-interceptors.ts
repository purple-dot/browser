import {
  JSONObject,
  RequestInterceptor,
  makeFetchRequestBody,
  parseFetchRequestBody,
  shopifyUrlStartsWith,
} from "./interceptors";
import ShopifyCart, {
  ShopifyCartItem,
  updatePreorderAttributes,
} from "./shopify-cart";
import { trackEvent } from "./tracking";

function shouldIntercept(input: string | URL) {
  return shopifyUrlStartsWith(input, "cart/add");
}

export class ShopifyCartAddInterceptor extends RequestInterceptor {
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
    let requestBody: ReturnType<typeof parseFetchRequestBody>;

    try {
      requestBody = parseFetchRequestBody(init);
    } catch (err) {
      // Unsupported body type, oh dear.
      return [input, init];
    }

    // Convert the Shopify add to cart request to our Cart API format.
    const newItems = getItemsFromRequest(requestBody);

    for (const item of newItems) {
      trackEvent("integration.added_to_cart", {
        variant_id: item.variantId,
        release_id: item.properties?.["__releaseId"] ?? null,
      }).catch(() => {});
    }

    // Keep track of if we find anything that needs changing so we can avoid changing things that don't need it.
    let changed = false;

    const updatedItems: ShopifyCartItem[] = [];
    for (const item of newItems) {
      const updatedItem = await updatePreorderAttributes(item);
      if (updatedItem) {
        updatedItems.push(updatedItem);
        changed = true;
      } else {
        updatedItems.push(item);
      }
    }

    // If we didn't alter anything, just return the original data.
    if (!changed) {
      return [input, init];
    }

    // Try to convert it back to the same kind of request we started with.
    let newBody: FormData | URLSearchParams | JSONObject = requestBody;

    if ("items" in requestBody) {
      newBody = shopifyAJAXAddToCart(updatedItems);
    } else {
      if (newItems.length > 1) {
        console.error(
          "Purple Dot: Only a single item can be added to the cart at a time when using /cart/add",
          { request: [input, init], newItems },
        );
        return [input, init];
      }

      newBody = shopifyFormAddToCart(updatedItems);
    }

    return [input, { ...init, body: makeFetchRequestBody(init, newBody) }];
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
): ShopifyCartItem[] {
  // Fix the documented /cart/add.js API
  // https://shopify.dev/api/ajax/reference/cart

  if ("items" in data) {
    const pdAddToCartRequests: ShopifyCartItem[] = [];

    const items = data["items"];

    if (Array.isArray(items)) {
      for (const item of items) {
        pdAddToCartRequests.push({
          variantId: `${item.id}`,
          quantity: parseFloat(item.quantity ?? "1"),
          properties: item.properties ?? {},
        });
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

  const pdRequests: ShopifyCartItem[] = [
    {
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

function shopifyAJAXAddToCart(request: ShopifyCartItem[]) {
  const items = request.map((item) => {
    return {
      id: item.id,
      quantity: item.quantity,
      properties: item.properties,
    };
  });

  return {
    items,
  };
}

function shopifyFormAddToCart(request: ShopifyCartItem[]) {
  // Convert to a /cart/add request
  const newBody = new URLSearchParams();

  for (const item of request) {
    newBody.append("id", item.variantId.toString());
    newBody.append("quantity", item.quantity?.toString() ?? "1");

    for (const [key, value] of Object.entries(item.properties ?? {})) {
      newBody.append(`properties[${key}]`, value);
    }
  }

  return newBody;
}

function applyURLEncodedAddToCart(
  item: ShopifyCartItem,
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
  if (ShopifyCart.hasPreorderAttributes(item)) {
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
  new ShopifyCartAddInterceptor();
}
