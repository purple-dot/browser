import { onceCheckoutScriptLoaded } from "./web-components";

export function open({ cartId }: { cartId: string; currency: string }) {
  const element = document.createElement("purple-dot-checkout");
  document.body.appendChild(element);

  onceCheckoutScriptLoaded(() => {
    // @ts-ignore
    element.open({ cartId });
  });
}
