import cookies from "js-cookie";
import { fetchVariantsPreorderState } from "./api";
import type { Cart, CartItem, PreorderAttributes, QuantityUpdate } from "./cart";
import type { JSONObject } from "./interceptors";

export interface ShopifyAJAXCartItem extends CartItem {
	variantId: string | null;
	quantity: number;
	properties?: Record<string, string>;
}

export class ShopifyAJAXCart implements Cart<ShopifyAJAXCartItem> {
	hasPreorderAttributes(item: ShopifyAJAXCartItem): boolean {
		return !!item.properties?.__releaseId;
	}

	addPreorderAttributes(item: ShopifyAJAXCartItem, attrs: PreorderAttributes) {
		return addAttributes({
			id: item.id,
			variantId: item.variantId,
			quantity: item.quantity,
			properties: {
				...item.properties,
				__releaseId: attrs.releaseId,
				"Purple Dot Pre-order": attrs.displayShipDates,
			},
		});
	}

	removePreorderAttributes(item: ShopifyAJAXCartItem) {
		return addAttributes({
			id: item.id,
			variantId: item.variantId,
			quantity: item.quantity,
			properties: Object.fromEntries(
				Object.entries(item.properties ?? {}).filter(
					([key]) => key !== "__releaseId" && key !== "Purple Dot Pre-order",
				),
			),
		});
	}

	async fetchItems() {
		// TODO: Add the locale to the URL
		const response = await fetch("/cart.js");
		const data = await response.json();

		return data.items.map((item: JSONObject) => {
			return {
				id: item.key ?? item.id ?? item.variant_id,
				variantId: item.variant_id,
				properties: item.properties,
			};
		});
	}

	async decrementQuantity(id: string) {
		const cartResponse = await fetch("/cart.js");
		const cart = await cartResponse.json();

		const lineItem = cart.items.find(
			(item: { id: number }) => item.id.toString() === id,
		);

		if (lineItem) {
			const updates = {
				[lineItem.id]: lineItem.quantity - 1,
			};

			await fetch("/cart/update.js", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					updates,
				}),
			});
		}
	}

	async updateQuantities(
		updates: QuantityUpdate[],
		cartId?: string | null,
	) {
		const cartResponse = await fetch("/cart.js");
		const cart = await cartResponse.json();

		const updateMap: Record<string, number> = {};

		for (const update of updates) {
			const lineItem = cart.items.find(
				(item: { id: number; key?: string }) =>
					item.id.toString() === update.id ||
					item.key === update.id,
			);

			if (lineItem) {
				updateMap[lineItem.id] = update.quantity;
			}
		}

		if (Object.keys(updateMap).length > 0) {
			await fetch("/cart/update.js", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					updates: updateMap,
				}),
			});
		}
	}

	async clear() {
		await fetch("/cart/clear.js", { method: "POST" });
	}

	async navigateToCheckout() {
		window.location.href = "/checkout";
	}

	async getCartId() {
		const shopifyCartId = cookies.get("cart");
		return shopifyCartId ?? null;
	}

	getCartType() {
		return "ajax";
	}
}

export async function updatePreorderAttributes(
	item: ShopifyAJAXCartItem,
): Promise<ShopifyAJAXCartItem | null> {
	if (item.variantId) {
		const variantId = parseFloat(item.variantId);
		const preorderState = await fetchVariantsPreorderState(variantId);

		if (preorderState == null) {
			return null;
		}

		const shopifyAJAXCart = new ShopifyAJAXCart();

		if (preorderState.state === "ON_PREORDER" && preorderState.waitlist) {
			const attributes = {
				releaseId: preorderState.waitlist.id,
				displayShipDates: preorderState.waitlist.display_dispatch_date,
			};

			return shopifyAJAXCart.addPreorderAttributes(item, attributes);
		}

		if (shopifyAJAXCart.hasPreorderAttributes(item)) {
			return shopifyAJAXCart.removePreorderAttributes(item);
		}
	}

	return null;
}

export function addAttributes<
	T extends { properties?: Record<string, string> },
>(x: T) {
	return {
		...x,
		attributes: Object.entries(x.properties ?? {}).map(([key, value]) => ({
			key,
			value,
		})),
	};
}
