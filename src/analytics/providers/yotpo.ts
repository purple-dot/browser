import { AnalyticsProvider, type EventHandlersMap } from "../provider";

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

	protected handlers: EventHandlersMap = {
		PreorderCreated: (event) => {
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
		OrderCreated: (event) => {
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
