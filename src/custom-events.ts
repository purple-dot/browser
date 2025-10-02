export function onDOMContentLoaded(cb: () => void) {
  if (document.readyState === "loading") {
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", cb);
  } else {
    // `DOMContentLoaded` has already fired
    cb();
  }
}

export function onLocationChange(cb: () => void) {
  let oldUrl = window.location.href;
  new MutationObserver(() => {
    const newUrl = window.location.href;
    if (oldUrl !== newUrl) {
      cb();
      oldUrl = newUrl;
    }
  }).observe(document.body, { attributes: true });
}

export interface PurpleDotEvents {
  Ready: Record<string, never>;

  // Placement events
  PlacementLoaded: {
    placementType: string;
    instanceId: string;
    skuId: string;
    sku: string;
    displayCurrency: string;
    disabled: boolean;
    releaseId: string;
  };
  PlacementFailed: {
    instanceId: string;
    placementType: string;
    message: string;
    reason: string;
  };
  LearnMoreClicked: {
    placementType: string;
    instanceId: string;
    skuId: string;
    sku: string;
    displayCurrency: string;
    releaseId: string;
  };
  ButtonClicked: {
    instanceId: string;
    skuId: string;
    sku: string;
    displayCurrency: string;
    releaseId: string;
  };

  // Cart events
  AddToCart: {
    skuId: string;
    internalSkuId: string;
    releaseId: string;
    price: { amount: number; currency: string };
    quantity: number;
  };
  RemoveFromCart: {
    lineItems: Array<{
      productId: string;
      skuId: string;
      name: string;
      sku: string;
      price: { amount: number; currency: string };
      quantity: number;
      purchaseType: string;
    }>;
    shipping: { amount: number };
    shippingAddress: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      province: string;
      country: string;
      zip: string;
    };
    email: string;
    total: { amount: number; currency: string };
    tax: { amount: number };
    discountCode?: string;
    checkoutState: string;
  };
  CheckoutLoaded: {
    enableCombinedCart: boolean;
  };

  // Pre-order events
  PreorderCheckoutStep: {
    skuId: string;
    stepName: string;
    stepNumber: number;
    releaseId: string;
    lineItems: Array<{
      productId: string;
      skuId: string;
      name: string;
      sku: string;
      price: { amount: number; currency: string };
      quantity: number;
      purchaseType: string;
    }>;
    shipping: { amount: number };
    shippingAddress: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      province: string;
      country: string;
      zip: string;
    };
    email: string;
    total: { amount: number; currency: string };
    tax: { amount: number };
    discountCode?: string;
  };
  PreorderCheckoutSubmitted: {
    skuId: string;
    releaseId: string;
  };
  PreorderCreated: {
    reference: string;
    email: string;
    shippingAddress: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      province: string;
      country: string;
      zip: string;
    };
    lineItems: Array<{
      productId: string;
      skuId: string;
      name: string;
      sku: string;
      price: { amount: number; currency: string };
      quantity: number;
      purchaseType: string;
    }>;
    total: { amount: number; currency: string };
    shipping: { amount: number };
    tax: { amount: number };
    discountCode?: string;
  };
  OrderCreated: {
    skuId: string;
    reference: string;
    email: string;
    shippingAddress: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      province: string;
      country: string;
      zip: string;
    };
    lineItem: {
      productId: string;
      skuId: string;
      name: string;
      sku: string;
      price: { amount: number; currency: string };
      quantity: number;
      purchaseType: string;
    };
    lineItems: Array<{
      productId: string;
      skuId: string;
      name: string;
      sku: string;
      price: { amount: number; currency: string };
      quantity: number;
      purchaseType: string;
    }>;
    total: { amount: number; currency: string };
    shipping: { amount: number };
    tax: { amount: number };
    discountCode?: string;
  };
  PreorderFailed: {
    skuId: string;
    errorMessage: string;
  };
  PreorderCancelled: {
    preorderReference: string;
  };

  // Other events
  ArrangeReturnClicked: {
    preorderReference: string;
  };
  CartButtonVisibilityChanged: {
    showing: boolean;
  };
}

export function onPurpleDotEvent<K extends keyof PurpleDotEvents>(
  name: K,
  cb: (data: PurpleDotEvents[K]) => void,
): void {
  window.addEventListener(`PurpleDot:${name}`, (event) => {
    if (!(event instanceof CustomEvent)) {
      return;
    }

    cb(event.detail);
  });
}
