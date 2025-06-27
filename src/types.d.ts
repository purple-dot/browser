import { PurpleDotConfig } from "./config";

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
}
