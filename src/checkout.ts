import { getCartAdapter } from "./cart";
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

export interface PurpleDotCheckoutElement extends Element {
	open: (args: { cartId: string; cartType: string }) => void;
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
}

export async function open(args?: { cartId?: string }) {
	if (document.querySelector("purple-dot-checkout")) {
		return;
	}

	const element = document.createElement("purple-dot-checkout");
	document.body.appendChild(element);

	return new Promise<void>((resolve) => {
		onceCheckoutScriptLoaded(async () => {
			const cartId = args?.cartId ?? (await getCartAdapter().getCartId());
			const cartType = getCartAdapter().getCartType();
			// @ts-ignore
			element.open({ cartId, cartType });

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
			// @ts-ignore
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
	let element = document.querySelector("purple-dot-checkout");

	if (!element) {
		element = document.createElement("purple-dot-checkout");
		document.body.appendChild(element);
	}

	return element as PurpleDotCheckoutElement;
}
