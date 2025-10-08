import type { EventForwardingConfig } from "../config";
import { AnalyticsProvider, type EventHandlersMap } from "../provider";

declare global {
	interface Window {
		ga?: (command: string, ...args: unknown[]) => void;
	}
}

export class GoogleAnalyticsProvider extends AnalyticsProvider {
	readonly name = "GoogleAnalytics";

	constructor(private readonly config: EventForwardingConfig) {
		super();
	}

	protected handlers: EventHandlersMap = {
		PreorderCreated: (event) => {
			if (!window.ga) {
				return;
			}

			for (const lineItem of event.lineItems) {
				window.ga("ec:addProduct", {
					id: lineItem.skuId,
				});
			}
			window.ga("ec:setAction", "purchase", {
				id: event.reference,
				revenue: event.total.amount,
			});
			window.ga("send", "event", "Ecommerce", "Purchase", {
				nonInteraction: 1,
			});
		},
		OrderCreated: (event) => {
			if (!window.ga) {
				return;
			}

			for (const lineItem of event.lineItems) {
				window.ga("ec:addProduct", {
					id: lineItem.skuId,
				});
			}
			window.ga("ec:setAction", "purchase", {
				id: event.reference,
				revenue: event.total.amount,
			});
			window.ga("send", "event", "Ecommerce", "Purchase", {
				nonInteraction: 1,
			});
		},
		PreorderCancelled: (event) => {
			if (!window.ga) {
				return;
			}

			window.ga("ec:setAction", "refund", {
				id: event.preorderReference,
			});
			window.ga("send", "event", "Ecommerce", "Refund", {
				nonInteraction: 1,
			});
		},
		AddToCart: (event) => {
			if (!window.ga) {
				return;
			}

			window.ga("ec:addProduct", {
				id: event.skuId,
				price: event.price.amount,
			});
			window.ga("ec:setAction", "add");
			window.ga("send", "event", "UX", "click", "add to cart");
		},
	};

	isEnabled(): boolean {
		return !!this.config.googleAnalytics;
	}
}
