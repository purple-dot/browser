import type { PurpleDotCheckoutElement } from "./checkout";
import type { PurpleDotConfig } from "./config";

declare global {
	interface Window {
		PurpleDotConfig?: PurpleDotConfig;

		Shopify?: {
			shop?: string;
			routes?: {
				root?: string;
			};
		};
	}

	interface HTMLElementTagNameMap {
		"purple-dot-checkout": PurpleDotCheckoutElement;
	}
}
