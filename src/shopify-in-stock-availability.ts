import type { ProductPreorderState } from "./api";

export async function shopifyInStockAvailability(
	_request: { variantId: string } | { productHandle: string },
	getPreorderState: () => Promise<ProductPreorderState>,
) {
	const preorderState = await getPreorderState();

	return preorderState.state === "AVAILABLE_IN_STOCK";
}
