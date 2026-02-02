import { getConfig } from "./config";
import type { FlagConfig } from "./feature-flags";
import { trackEvent } from "./tracking";

export const PD_HOST_URL = "https://www.purpledotprice.com";

export interface ProductPreorderState {
	state: NewEndpointPreorderState;
	waitlist: {
		id: string;
		selling_plan_id: string | null;
		display_dispatch_date: string;
		payment_plan_descriptions: {
			long: string;
			short: string;
		} | null;
		units_left: number;
		compatible_checkouts: ("purple_dot" | "native")[];
	} | null;
}

export async function fetchProductsPreorderState(
	handle: string,
): Promise<ProductPreorderState | null> {
	const url = new URL(`${PD_HOST_URL}/api/v1/products/preorder-state`);

	identifyShop(url);

	url.searchParams.set("handle", handle);
	const resp = await fetch(url.toString());

	if (resp.ok) {
		const body = await resp.json();

		trackEvent("integration.product_viewed", {
			product_handle: handle,
			release_id:
				body.data.state === "ON_PREORDER" ? body.data.waitlist.id : null,
			source: "api_call",
		}).catch(() => {});

		return body.data;
	}

	return null;
}

export type NewEndpointPreorderState =
	| "NO_OPEN_WAITLISTS"
	| "AVAILABLE_IN_STOCK"
	| "ON_PREORDER"
	| "SOLD_OUT";

export interface VariantPreorderState {
	state: NewEndpointPreorderState;
	waitlist: {
		id: string;
		selling_plan_id: string | null;
		display_dispatch_date: string;
		payment_plan_descriptions: {
			long: string;
			short: string;
		} | null;
		units_left: number;
		compatible_checkouts: ("purple_dot" | "native")[];
	} | null;
	product: {
		id: string;
		handle: string;
	};
}

export async function fetchVariantsPreorderState(
	variantId: string | number,
): Promise<VariantPreorderState | null> {
	const url = new URL(`${PD_HOST_URL}/api/v1/variants/preorder-state`);

	identifyShop(url);

	url.searchParams.set("variant_id", variantId.toString());
	const resp = await fetch(url.toString());

	if (resp.ok) {
		const body = await resp.json();

		trackEvent("integration.sku_selected", {
			sku_external_id: variantId.toString(),
			release_id:
				body.data.state === "ON_PREORDER" ? body.data.waitlist.id : null,
			source: "api_call",
		}).catch(() => {});

		return body.data;
	}

	return null;
}

interface IntegrationSettings {
	flags: FlagConfig[];
}

export async function fetchIntegrationSettings(): Promise<IntegrationSettings | null> {
	const url = new URL(`${PD_HOST_URL}/api/v1/integration-settings`);

	identifyShop(url);
	const resp = await fetch(url.toString());

	if (resp.ok) {
		const body = await resp.json();

		return body.data;
	}

	return null;
}

function identifyShop(url: URL) {
	const apiKey = getConfig()?.apiKey;
	if (apiKey) {
		url.searchParams.set("api_key", apiKey);
	} else if (window.Shopify?.shop) {
		url.searchParams.set("shop", window.Shopify.shop);
	}
}
