import { onceCheckoutScriptLoaded } from "./web-components";
import { getCartAdapter } from "./cart";

export async function open(args?: { cartId?: string }) {
  const element = document.createElement("purple-dot-checkout");
  document.body.appendChild(element);

  return new Promise<void>((resolve) => {
    onceCheckoutScriptLoaded(async () => {
      const cartId = args?.cartId ?? (await getCartAdapter().getCartId());
      // @ts-ignore
      element.open({ cartId });

      resolve();
    });
  });
}
