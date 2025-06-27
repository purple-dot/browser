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
}

export interface Cart<T extends CartItem> {
	hasPreorderAttributes: (item: T) => boolean;
	addPreorderAttributes: (item: T, attrs: PreorderAttributes) => T;
	removePreorderAttributes: (item: T) => T;

	// Queries
	fetchItems: (cartId?: string) => Promise<Required<T>[]>;
	getCartId: () => Promise<string | null>;
	getCartType: () => string;

	// Mutations
	decrementQuantity: (id: string, cartId?: string) => Promise<void>;
	clear: (cartId?: string) => Promise<void>;
	navigateToCheckout: (cartId?: string) => Promise<void>;
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
