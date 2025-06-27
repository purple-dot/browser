import type { ProductPreorderState } from "./api";

export async function shopifyInStockAvailability(
	preorderStatePromise: Promise<ProductPreorderState>,
) {
	const preorderState = await preorderStatePromise;

	return preorderState.state === "AVAILABLE_IN_STOCK";
}
