import {
  fetchProductsPreorderState,
  fetchVariantsPreorderState,
  type ProductPreorderState,
} from "./api";
import { getConfig } from "./config";

type AvailabilityRequest<J> = J extends
  | { variantId: string }
  | { productHandle: string }
  ? J
  : never;

/**
 * Returns the availability of a product or variant.
 *
 * Use this when rendering buttons on PDPs etc to decide what the correct behavior is for an item.
 *
 * @param request The product or variant to check the availability of.
 * @param inStockCallback A callback to check if the product is in stock.
 * @returns The in stock/preorder/out of stock state of the product or variant.
 */
export async function availability<I, J>(
  request: AvailabilityRequest<J>,
  inStockCallback?: (
    request: AvailabilityRequest<J>,
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

  if (state?.state === "SOLD_OUT") {
    return { state: "SOLD_OUT" };
  }

  // At this point we know that it should not be considered in stock, so remap it to a waitlist if there is one.

  if (state?.waitlist) {
    return { state: "ON_PREORDER", waitlist: state.waitlist };
  }

  return { state: "SOLD_OUT" };
}

interface PurpleDotWaitlist {
  id: string;
  selling_plan_id?: string;
  display_dispatch_date: string;
  units_left: number;
  compatible_checkouts: ("purple_dot" | "native")[];
}

export interface PurpleDotOnPreorder {
  state: "ON_PREORDER";
  waitlist: PurpleDotWaitlist;
}

export interface PurpleDotAvailableInStock<I> {
  state: "AVAILABLE_IN_STOCK";
  available?: I;
  waitlist?: PurpleDotWaitlist;
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
      waitlist: mapWaitlist(preorderState.waitlist),
    };
  } else if (preorderState?.state === "AVAILABLE_IN_STOCK") {
    return {
      state: "AVAILABLE_IN_STOCK",
      waitlist: mapWaitlist(preorderState.waitlist),
    };
  } else if (preorderState?.state === "SOLD_OUT") {
    return { state: "SOLD_OUT" };
  } else {
    return null;
  }
}

function mapWaitlist<
  T extends ProductPreorderState["waitlist"] | undefined | null,
>(waitlist: T): T extends null | undefined ? undefined : PurpleDotWaitlist {
  if (!waitlist) {
    return undefined as T extends null | undefined
      ? undefined
      : PurpleDotWaitlist;
  }

  return {
    id: waitlist.id,
    selling_plan_id: waitlist.selling_plan_id ?? undefined,
    display_dispatch_date: waitlist.display_dispatch_date,
    units_left: waitlist.units_left,
    compatible_checkouts: waitlist.compatible_checkouts,
  } as T extends null | undefined ? undefined : PurpleDotWaitlist;
}
