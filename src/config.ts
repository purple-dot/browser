import type { Cart, CartItem } from "./cart";

export interface PurpleDotConfig {
	apiKey: string;
	cartAdapter: Cart<CartItem>;
}

let config: PurpleDotConfig | null = null;

export function setConfig(c: PurpleDotConfig) {
	config = c;

	// For compatibility with checkout.js script that reads the config from window
	if (globalThis.window) {
		globalThis.window.PurpleDotConfig = c;
	}
}

export function getConfig() {
	return config;
}
