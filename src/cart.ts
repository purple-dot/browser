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
