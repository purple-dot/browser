// @vitest-environment happy-dom

import { waitFor } from "@testing-library/dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import {
	injectComponentScripts,
	onceCheckoutScriptLoaded,
} from "../src/web-components";

describe("onceCheckoutScriptLoaded", () => {
	beforeEach(() => {
		// Configure Happy DOM to enable JavaScript evaluation and file loading
		// biome-ignore lint/suspicious/noExplicitAny: Happy DOM types are not fully exposed
		const windowWithHappyDOM = window as any;
		if (windowWithHappyDOM.happyDOM?.settings) {
      // Use of this setting is a potential security risk. If this ever evaluated untrusted code, it could lead to a security vulnerability.
      // We enable this as we are verifying we can load scripts from our own domain.
			windowWithHappyDOM.happyDOM.settings.enableJavaScriptEvaluation = true;
			windowWithHappyDOM.happyDOM.settings.disableJavaScriptFileLoading = false;
		}
	});

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
