import type { EventForwardingConfig } from "../config";
import { AnalyticsProvider, type EventHandlersMap } from "../provider";

declare global {
	interface Window {
		Northbeam?: {
			firePurchaseEvent: (data: {
				id: string;
				totalPrice: number;
				shippingPrice: number;
				taxPrice: number;
				coupons?: string;
				currency: string;
				customerId: string | null;
				lineItems: Array<{
					productId: string;
					variantId: string;
					productName: string;
					variantName: string;
					price: number;
					quantity: number;
				}>;
			}) => void;
		};
		onNorthbeamLoad?: () => void;
	}
}

export class NorthbeamProvider extends AnalyticsProvider {
	readonly name = "Northbeam";

	constructor(private readonly config: EventForwardingConfig) {
		super();
	}

	protected handlers: EventHandlersMap = {
		PreorderCreated: (event) => {
			const trackPurchaseEvent = () => {
				window.Northbeam?.firePurchaseEvent({
					id: event.reference,
					totalPrice: event.total.amount,
					shippingPrice: event.shipping.amount,
					taxPrice: event.tax.amount,
					coupons: event.discountCode,
					currency: event.total.currency,
					customerId: null,
					lineItems: event.lineItems.map((lineItem) => ({
						productId: lineItem.productId,
						variantId: lineItem.skuId,
						productName: lineItem.name,
						variantName: lineItem.sku,
						price: lineItem.price.amount,
						quantity: lineItem.quantity,
					})),
				});
			};

			if (window.Northbeam) {
				trackPurchaseEvent();
			} else {
				window.onNorthbeamLoad = () => {
					trackPurchaseEvent();
				};
			}
		},
		OrderCreated: (event) => {
			const trackPurchaseEvent = () => {
				window.Northbeam?.firePurchaseEvent({
					id: event.reference,
					totalPrice: event.total.amount,
					shippingPrice: event.shipping.amount,
					taxPrice: event.tax.amount,
					coupons: event.discountCode,
					currency: event.total.currency,
					customerId: null,
					lineItems: event.lineItems.map((lineItem) => ({
						productId: lineItem.productId,
						variantId: lineItem.skuId,
						productName: lineItem.name,
						variantName: lineItem.sku,
						price: lineItem.price.amount,
						quantity: lineItem.quantity,
					})),
				});
			};

			if (window.Northbeam) {
				trackPurchaseEvent();
			} else {
				window.onNorthbeamLoad = () => {
					trackPurchaseEvent();
				};
			}
		},
	};

	isEnabled(): boolean {
		return !!this.config.northbeamPixel;
	}
}
