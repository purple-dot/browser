import { v4 } from "uuid";
import { fetchIntegrationSettings, fetchVariantsPreorderState } from "./api";
import { type CartItem, getCartAdapter } from "./cart";
import { getConfig } from "./config";
import { FeatureFlags } from "./feature-flags";
import { idFromGid } from "./gid";
import { onceCheckoutScriptLoaded } from "./web-components";

export type PurpleDotAddItemResponse =
	| {
			success: true;
			error: null;
	  }
	| {
			success: false;
			error: {
				message: string;
				data: Record<string, unknown>;
			};
	  };

export interface PurpleDotCheckoutElement extends HTMLElement {
	open: (args: { cartId: string | null; cartType: string }) => void;
	close: () => void;
	expressCheckout: (args: {
		variantId: string;
		releaseId: string;
		currency: string;
		quantity: number;
		templatePaymentPlanId?: string;
	}) => void;
	addItem: (args: {
		variantId: string;
		releaseId: string;
		currency: string;
		quantity: number;
		templatePaymentPlanId?: string;
	}) => Promise<PurpleDotAddItemResponse>;
	show: () => void;
	locale?: string;
}

const CHECKOUT_ELEMENT = "purple-dot-checkout";

export async function open(args?: { cartId?: string; sessionId?: string }) {
	if (document.querySelector(CHECKOUT_ELEMENT)) {
		return;
	}

	const element = document.createElement(CHECKOUT_ELEMENT);
	const config = getConfig();
	if (config?.locale) {
		element.locale = config.locale;
	}
	document.body.appendChild(element);

	const cartAdapter = getCartAdapter();
	const cartId = args?.cartId ?? (await cartAdapter.getCartId());
	const cartType = cartAdapter.getCartType();
	const cartItems = await cartAdapter.fetchItems(cartId);
	const requiresSeparateCheckout = await cartRequiresSeparateCheckout(
		cartItems,
		args?.sessionId,
	);

	return new Promise<void>((resolve) => {
		onceCheckoutScriptLoaded(async () => {
			if (requiresSeparateCheckout) {
				element.open({ cartId, cartType });
			} else {
				await cartAdapter.navigateToCheckout(cartId);
			}

			resolve();
		});
	});
}

export async function openExpressCheckout(args: {
	variantId: string;
	releaseId: string;
	currency: string;
	quantity: number;
	templatePaymentPlanId?: string;
}) {
	const element = getOrCreateCheckoutElement();

	return new Promise<void>((resolve) => {
		onceCheckoutScriptLoaded(async () => {
			element.expressCheckout(args);
			resolve();
		});
	});
}

export async function purpleDotCheckout<T>(
	cb: (element: PurpleDotCheckoutElement) => T,
) {
	const element = getOrCreateCheckoutElement();

	return new Promise<T>((resolve) => {
		onceCheckoutScriptLoaded(async () => {
			const result = await cb(element);
			resolve(result);
		});
	});
}

function getOrCreateCheckoutElement() {
	let element = document.querySelector(CHECKOUT_ELEMENT);

	if (!element) {
		element = document.createElement(CHECKOUT_ELEMENT);
		const config = getConfig();
		if (config?.locale) {
			element.locale = config.locale;
		}
		document.body.appendChild(element);
	}
	return element;
}

let sessionIdFallback: string;

async function cartRequiresSeparateCheckout(
	cartItems: CartItem[],
	sessionId?: string,
) {
	const results = await Promise.all(
		cartItems.map((cartItem) => cartItemRequiresSeparateCheckout(cartItem)),
	);
	const requiresSeparate = results.some((result) => result);

	if (requiresSeparate) {
		return true;
	}

	if (!sessionIdFallback) {
		sessionIdFallback = v4();
	}

	const integrationSettings = await fetchIntegrationSettings();
	const flags = integrationSettings?.flags ?? [];
	const featureFlags = new FeatureFlags(flags, sessionId ?? sessionIdFallback);

	const variation = featureFlags.variation("NATIVE_CHECKOUT");
	if (variation === "native") {
		return false;
	}

	return true;
}

async function cartItemRequiresSeparateCheckout(cartItem: CartItem) {
	if (cartItem.variantId) {
		const requiredAttr = cartItem.attributes.find(
			({ key }) => key === "__pdCheckoutRequired",
		);
		if (requiredAttr) {
			return requiredAttr.value === "true";
		}

		const res = await fetchVariantsPreorderState(idFromGid(cartItem.variantId));
		if (
			res &&
			(!res.waitlist || res.waitlist.compatible_checkouts.includes("native"))
		) {
			return false;
		}
	}

	return true;
}
