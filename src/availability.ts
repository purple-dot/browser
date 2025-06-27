import {
	fetchProductsPreorderState,
	fetchVariantsPreorderState,
	type ProductPreorderState,
} from "./api";
import { getConfig } from "./config";

/**
 * Returns the availability of a product or variant.
 *
 * Use this when rendering buttons on PDPs etc to decide what the correct behavior is for an item.
 *
 * @param request The product or variant to check the availability of.
 * @param inStockCallback A callback to check if the product is in stock.
 * @returns The in stock/preorder/out of stock state of the product or variant.
 */
export async function availability<I>(
	request: { variantId: string } | { productHandle: string },
	inStockCallback?: (
		request: { variantId: string } | { productHandle: string },
		getPreorderState: () => Promise<PurpleDotAvailability | null>,
	) => Promise<I | false>,
): Promise<PurpleDotAvailability<I>> {
	const config = getConfig();

	// Don't immediately fetch the preorder state, as it may not be needed.

	let preorderStatePromise: Promise<PurpleDotAvailability | null> | undefined;
	const getPreorderState = () => {
		if (!preorderStatePromise) {
			const fetchPromise =
				"variantId" in request
					? fetchVariantsPreorderState(request.variantId)
					: fetchProductsPreorderState(request.productHandle);

			preorderStatePromise = fetchPromise.then((state) =>
				mapPreorderStateToAvailability(state),
			);
		}

		return preorderStatePromise;
	};

	const thisInStockCallback = inStockCallback ?? config?.inStockAvailability;

	const inStockAvailable = thisInStockCallback
		? await thisInStockCallback(request, getPreorderState)
		: false;

	if (inStockAvailable) {
		return { state: "AVAILABLE_IN_STOCK", available: inStockAvailable };
	}

	const state = await getPreorderState();
	return state ?? { state: "SOLD_OUT" };
}

export interface PurpleDotOnPreorder {
	state: "ON_PREORDER";
	waitlist: {
		id: string;
		selling_plan_id?: string;
		display_dispatch_date: string;
		units_left: number;
	};
}

export interface PurpleDotAvailableInStock<I> {
	state: "AVAILABLE_IN_STOCK";
	available?: I;
}

export interface PurpleDotSoldOut {
	state: "SOLD_OUT";
}

export type PurpleDotAvailability<I = any> =
	| PurpleDotOnPreorder
	| PurpleDotAvailableInStock<I>
	| PurpleDotSoldOut;

function mapPreorderStateToAvailability(
	preorderState: ProductPreorderState | null,
): PurpleDotAvailability | null {
	if (preorderState?.state === "ON_PREORDER" && preorderState.waitlist) {
		return {
			state: "ON_PREORDER",
			waitlist: {
				id: preorderState.waitlist.id,
				selling_plan_id: preorderState.waitlist.selling_plan_id ?? undefined,
				display_dispatch_date: preorderState.waitlist.display_dispatch_date,
				units_left: preorderState.waitlist.units_left,
			},
		};
	} else if (preorderState?.state === "AVAILABLE_IN_STOCK") {
		return { state: "AVAILABLE_IN_STOCK" };
	} else if (preorderState?.state === "SOLD_OUT") {
		return { state: "SOLD_OUT" };
	} else {
		return null;
	}
}
