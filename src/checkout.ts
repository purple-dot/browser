import { onceCheckoutScriptLoaded } from "./web-components";
import { getCartAdapter } from "./cart";

export async function open(args?: { cartId?: string }) {
  if (document.querySelector("purple-dot-checkout")) {
    return;
  }

  const element = document.createElement("purple-dot-checkout");
  document.body.appendChild(element);

  return new Promise<void>((resolve) => {
    onceCheckoutScriptLoaded(async () => {
      const cartId = args?.cartId ?? (await getCartAdapter().getCartId());
      const cartType = getCartAdapter().getCartType();
      // @ts-ignore
      element.open({ cartId, cartType });

      resolve();
    });
  });
}

export async function openExpressCheckout(args: {
  variantId: string;
  releaseId: string;
  currency: string;
  quantity: number;
  templatePaymentPlanId?: string;
}) {
  if (document.querySelector("purple-dot-checkout")) {
    return;
  }

  const element = document.createElement("purple-dot-checkout");
  document.body.appendChild(element);

  return new Promise<void>((resolve) => {
    onceCheckoutScriptLoaded(async () => {
      // @ts-ignore
      element.expressCheckout(args);

      resolve();
    });
  });
}
