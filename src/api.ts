export async function fetchProductsPreorderState(handle: string) {
  const url = new URL(
    "https://www.purpledotprice.com/api/v1/products/preorder-state",
  );

  identifyShop(url);

  url.searchParams.set("handle", handle);
  const resp = await fetch(url.toString());

  if (resp.ok) {
    const body = await resp.json();
    return body.data;
  }

  return undefined;
}

export enum NewEndpointPreorderState {
  NoOpenWaitlists = "NO_OPEN_WAITLISTS",
  AvailableInStock = "AVAILABLE_IN_STOCK",
  OnPreorder = "ON_PREORDER",
  SoldOut = "SOLD_OUT",
}

export interface VariantPreorderState {
  state: NewEndpointPreorderState;
  waitlist: {
    id: string;
    selling_plan_id: string | null;
    display_dispatch_date: string;
    payment_plan_descriptions: {
      long: string;
      short: string;
    } | null;
    units_left: number;
  } | null;
  product: {
    id: string;
    handle: string;
  };
}

export async function fetchVariantsPreorderState(
  variantId: number,
): Promise<VariantPreorderState | null> {
  const url = new URL(
    "https://www.purpledotprice.com/api/v1/variants/preorder-state",
  );

  identifyShop(url);

  url.searchParams.set("variant_id", variantId.toString());
  const resp = await fetch(url.toString());

  if (resp.ok) {
    const body = await resp.json();
    return body.data;
  }

  return null;
}

function identifyShop(url: URL) {
  if (window.PurpleDotConfig?.apiKey) {
    url.searchParams.set("api_key", window.PurpleDotConfig.apiKey);
  } else if (window.Shopify?.shop) {
    url.searchParams.set("shop", window.Shopify.shop);
  }
}
