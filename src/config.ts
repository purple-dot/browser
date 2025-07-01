import type { PurpleDotAvailability } from "./availability";
import type { Cart, CartItem } from "./cart";

/**
 * Global Purple Dot configuration.
 */
export interface PurpleDotConfig {
	/**
	 * The Purple Dot API key for the store.
	 */
	apiKey: string;

	/**
	 * Optional cart adapter for working with the combined checkout.
	 */
	cartAdapter?: Cart<CartItem>;

	/**
	 * Optional default hook for checking the in stock availability of a product.
	 */
	inStockAvailability?: <I>(
		request: { variantId: string } | { productHandle: string },
		getPreorderState: () => Promise<PurpleDotAvailability | null>,
	) => Promise<I | false>;
}
let config: PurpleDotConfig | null = null;

export function setConfig(newConfig: PurpleDotConfig) {
	config = newConfig;

	// For compatibility with checkout.js script that reads the config from window
	if (globalThis.window) {
		globalThis.window.PurpleDotConfig = newConfig;
	}
}

export function getConfig() {
	return config;
}
