// @vitest-environment happy-dom

import { waitFor } from "@testing-library/dom";
import { describe, expect, test, vi } from "vitest";

import {
	injectComponentScripts,
	onceCheckoutScriptLoaded,
} from "../src/web-components";

describe("onceCheckoutScriptLoaded", () => {
	test("fires the callback once the script is loaded", async () => {
		const callback = vi.fn();
		onceCheckoutScriptLoaded(callback);

		injectComponentScripts();

		// Find the script element and manually trigger the load event
		// We do this because we have not enabled JavaScript evaluation in Happy DOM.
		const script = document.getElementById("pd-checkout-script");
		expect(script).toBeTruthy();
		expect((script as HTMLScriptElement)?.src).toBe(
			"https://www.purpledotprice.com/api/v1/checkout.js",
		);

		// Manually dispatch the load event
		script?.dispatchEvent(new Event("load"));

		expect(callback).toHaveBeenCalled();
	});

	test("fires the callback immediately if the script is already loaded", async () => {
		const callback = vi.fn();
		onceCheckoutScriptLoaded(callback);

		injectComponentScripts();

		await waitFor(() => {
			expect(callback).toHaveBeenCalled();
		});

		const anotherCallback = vi.fn();
		onceCheckoutScriptLoaded(anotherCallback);
		expect(anotherCallback).toHaveBeenCalled();
	});
});
