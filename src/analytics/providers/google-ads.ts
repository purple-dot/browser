import type { EventForwardingConfig } from "../config";
import { AnalyticsProvider, type EventHandlersMap } from "../provider";

declare global {
	interface Window {
		gtag?: (
			command: string,
			action: string,
			params?: Record<string, unknown>,
		) => void;
	}
}

export class GoogleAdsProvider extends AnalyticsProvider {
	readonly name = "GoogleAds";

	constructor(private readonly config: EventForwardingConfig) {
		super();
	}

	protected handlers: EventHandlersMap = {
		PreorderCreated: (event) => {
			if (!window.gtag) {
				return;
			}

			const sendTo = this.config.googleAdsTag?.sendTo;
			if (!sendTo) {
				return;
			}

			window.gtag("event", "conversion", {
				send_to: sendTo,
				value: event.total.amount,
				currency: event.total.currency,
				transaction_id: event.reference,
			});
		},
		OrderCreated: (event) => {
			if (!window.gtag) {
				return;
			}

			const sendTo = this.config.googleAdsTag?.sendTo;
			if (!sendTo) {
				return;
			}

			window.gtag("event", "conversion", {
				send_to: sendTo,
				value: event.total.amount,
				currency: event.total.currency,
				transaction_id: event.reference,
			});
		},
		AddToCart: (event) => {
			if (!window.gtag) {
				return;
			}

			const sendTo = this.config.googleAdsTag?.sendTo;
			if (!sendTo) {
				return;
			}

			window.gtag("event", "add_to_cart", {
				id: event.skuId,
				currency: event.price.currency,
				price: event.price.amount,
			});
		},
	};

	isEnabled(): boolean {
		return !!this.config.googleAdsTag?.sendTo;
	}
}
