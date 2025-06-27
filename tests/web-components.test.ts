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

		return waitFor(() => {
			expect(callback).toHaveBeenCalled();
		});
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
