import { getConfig } from "./config";

export type ShipDates = {
	earliest: Date;
	latest: Date;
};

export type PreorderAttributes = {
	releaseId: string;
	displayShipDates: string;
};

export interface CartItem {
	id: string;
	variantId: string | null;
	quantity: number;
	attributes: { key: string; value: string }[];
}

export interface Cart<T extends CartItem> {
	hasPreorderAttributes: (item: T) => boolean;
	addPreorderAttributes: (item: T, attrs: PreorderAttributes) => T;
	removePreorderAttributes: (item: T) => T;

	// Queries
	fetchItems: (cartId?: string | null) => Promise<Required<T>[]>;
	getCartId: () => Promise<string | null>;
	getCartType: () => string;

	// Mutations
	decrementQuantity: (id: string, cartId?: string | null) => Promise<void>;
	clear: (cartId?: string | null) => Promise<void>;
	navigateToCheckout: (cartId?: string | null) => Promise<void>;
}

export async function cartHasPreorderItem(cartItems?: CartItem[]) {
	const cart = getCartAdapter();
	const items = cartItems ?? (await cart.fetchItems());
	return items.some((i) => cart.hasPreorderAttributes(i));
}

export function getCartAdapter(): Cart<CartItem> {
	const cart = getConfig()?.cartAdapter;
	if (!cart) {
		throw new Error("@purple-dot/browser not initialised");
	}
	return cart;
}

export function purpleDotAttributes(variant: {
	isPreorder: boolean;
	releaseId?: string | null;
	sellingPlanId?: string | null;
	compatibleCheckouts?: string[];
	estimatedShipDates?: string | null;
}): { key: string; value: string }[] {
	if (!variant.isPreorder) {
		return [];
	}

	const attributes = [];

	if (variant.releaseId) {
		attributes.push({ key: "__releaseId", value: variant.releaseId });
	}

	if (!variant.sellingPlanId && variant.estimatedShipDates) {
		attributes.push({
			key: "Purple Dot Pre-order",
			value: variant.estimatedShipDates,
		});
	}

	if (variant.compatibleCheckouts) {
		attributes.push({
			key: "__pdCheckoutRequired",
			value: variant.compatibleCheckouts.includes("native") ? "false" : "true",
		});
	}

	return attributes;
}
