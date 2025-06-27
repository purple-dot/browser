import * as checkout from "../../src/checkout";
import * as PurpleDotMain from "../../src/index";
import { ShopifyAJAXCart } from "../../src/shopify-ajax-cart";

const PurpleDot = {
	...PurpleDotMain,
	checkout,
	ShopifyAJAXCart,
};

declare global {
	interface Window {
		PurpleDot: typeof PurpleDot;
	}
}

window.PurpleDot = PurpleDot;
