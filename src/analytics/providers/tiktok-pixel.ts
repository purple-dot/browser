import type { EventForwardingConfig } from "../config";
import { AnalyticsProvider, type EventHandlersMap } from "../provider";

declare global {
	interface Window {
		ttq?: {
			track: (event: string, params?: Record<string, unknown>) => void;
		};
	}
}

export class TikTokPixelProvider extends AnalyticsProvider {
	readonly name = "TikTokPixel";

	constructor(private readonly config: EventForwardingConfig) {
		super();
	}

	protected handlers: EventHandlersMap = {
		PreorderCreated: (event) => {
			if (!window.ttq) {
				return;
			}

			window.ttq.track("PlaceAnOrder", {
				content_type: "product",
				quantity: event.lineItems.length,
				content_id: event.reference,
				currency: event.total.currency,
				value: event.total.amount,
			});
		},
		OrderCreated: (event) => {
			if (!window.ttq) {
				return;
			}

			window.ttq.track("PlaceAnOrder", {
				content_type: "product",
				quantity: event.lineItems.length,
				content_id: event.reference,
				currency: event.total.currency,
				value: event.total.amount,
			});
		},
	};

	isEnabled(): boolean {
		return !!this.config.tikTokPixel;
	}
}
