import type { PurpleDotEvents } from "../../custom-events";
import type { EventForwardingConfig } from "../config";
import { AnalyticsProvider } from "../provider";

declare global {
  interface Window {
    yotpoTrackConversionData?: {
      source: string;
      platform: string;
      orderId: string;
      orderNumber: string;
      orderName: string;
      orderAmount: number;
      orderCurrency: string;
    };
  }
}

export class YotpoProvider extends AnalyticsProvider {
  readonly name = "Yotpo";

  constructor(private readonly config: EventForwardingConfig) {
    super();
  }

  protected handlers = {
    PreorderCreated: (event: PurpleDotEvents["PreorderCreated"]) => {
      window.yotpoTrackConversionData = {
        source: "pixel_v2",
        platform: "shopify",
        orderId: event.reference,
        orderNumber: event.reference,
        orderName: event.reference,
        orderAmount: event.total.amount,
        orderCurrency: event.total.currency,
      };
    },
    OrderCreated: (event: PurpleDotEvents["OrderCreated"]) => {
      window.yotpoTrackConversionData = {
        source: "pixel_v2",
        platform: "shopify",
        orderId: event.reference,
        orderNumber: event.reference,
        orderName: event.reference,
        orderAmount: event.total.amount,
        orderCurrency: event.total.currency,
      };
    },
  };

  isEnabled(): boolean {
    return !!this.config.yotpo;
  }
}
