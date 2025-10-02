import type { PurpleDotEvents } from "../../custom-events";
import type { EventForwardingConfig } from "../config";
import { AnalyticsProvider } from "../provider";

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

export class FacebookPixelProvider extends AnalyticsProvider {
  readonly name = "FacebookPixel";

  constructor(private readonly config: EventForwardingConfig) {
    super();
  }

  protected handlers = {
    PreorderCreated: (event: PurpleDotEvents["PreorderCreated"]) => {
      if (!window.fbq) {
        return;
      }

      const attrs = {
        currency: event.total.currency,
        value: event.total.amount,
        content_type: "product",
        content_ids: event.lineItems.map((i) => i.skuId),
      };
      window.fbq("track", "Purchase", attrs);
      window.fbq("trackCustom", "Preorder", attrs);
    },
    OrderCreated: (event: PurpleDotEvents["OrderCreated"]) => {
      if (!window.fbq) {
        return;
      }

      const attrs = {
        currency: event.total.currency,
        value: event.total.amount,
        content_type: "product",
        content_ids: event.lineItems.map((i) => i.skuId),
      };
      window.fbq("track", "Purchase", attrs);
      window.fbq("trackCustom", "Preorder", attrs);
    },
    AddToCart: (event: PurpleDotEvents["AddToCart"]) => {
      if (!window.fbq) {
        return;
      }

      const attrs = {
        currency: event.price.currency,
        value: event.price.amount,
        content_type: "product",
        content_ids: [event.skuId],
      };
      window.fbq("track", "AddToCart", attrs);
    },
  };

  isEnabled(): boolean {
    return !!this.config.facebookPixel;
  }
}
