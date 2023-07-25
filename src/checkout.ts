export function open({ cartId }: { cartId: string; currency: string }) {
  const element = document.createElement("purple-dot-checkout");
  document.body.appendChild(element);

  // @ts-ignore
  element.open({ cartId });
}
