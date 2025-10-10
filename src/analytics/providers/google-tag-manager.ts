import { AnalyticsProvider, type EventHandlersMap } from "../provider";

declare global {
	interface Window {
		dataLayer?: Array<Record<string, unknown>>;
	}
}

export class GoogleTagManagerProvider extends AnalyticsProvider {
	readonly name = "GoogleTagManager";

	protected handlers: EventHandlersMap = {
		PreorderCreated: (event) => {
			if (!window.dataLayer) {
				return;
			}

			window.dataLayer.push({ ecommerce: null });

			window.dataLayer.push({
				event: "purchase",
				ecommerce: {
					transaction_id: event.reference,
					shipping: event.shipping.amount,
					value: event.total.amount,
					currency: event.total.currency,
					tax: event.tax.amount,
					items: event.lineItems.map((lineItem) => ({
						item_id: lineItem.productId,
						item_name: lineItem.name,
						item_category: undefined,
						coupon: event.discountCode,
						price: lineItem.price.amount,
						quantity: lineItem.quantity,
						item_variant: lineItem.sku,
						purchase_type: lineItem.purchaseType,
					})),
					purchase_type: "Pre-order",
				},
			});
		},
		OrderCreated: (event) => {
			if (!window.dataLayer) {
				return;
			}

			window.dataLayer.push({ ecommerce: null });

			window.dataLayer.push({
				event: "purchase",
				ecommerce: {
					transaction_id: event.reference,
					shipping: event.shipping.amount,
					value: event.total.amount,
					currency: event.total.currency,
					tax: event.tax.amount,
					items: event.lineItems.map((lineItem) => ({
						item_id: lineItem.productId,
						item_name: lineItem.name,
						item_category: undefined,
						coupon: event.discountCode,
						price: lineItem.price.amount,
						quantity: lineItem.quantity,
						item_variant: lineItem.sku,
						purchase_type: lineItem.purchaseType,
					})),
					purchase_type: "Pre-order",
				},
			});
		},
	};

	isEnabled(): boolean {
		return !!this.config.gtmDataLayer;
	}
}
