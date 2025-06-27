import { describe, expect, test } from "vitest";

import { ShopifyAJAXCart } from "../src/shopify-ajax-cart";

const shopifyAJAXCart = new ShopifyAJAXCart();

describe("fetch", () => {
	describe("hasPreorderAttributes", () => {
		test("returns true if the item has a __releaseId property", () => {
			const item = {
				id: "1",
				variantId: "1",
				properties: { __releaseId: "123" },
			};
			expect(shopifyAJAXCart.hasPreorderAttributes(item)).toBe(true);
		});

		test("returns false if the item does not have a __releaseId property", () => {
			const item = { id: "1", variantId: "1", properties: { foo: "bar" } };
			expect(shopifyAJAXCart.hasPreorderAttributes(item)).toBe(false);
		});
	});

	describe("addPreorderAttributes", () => {
		test("adds attributes to the item properties", () => {
			const item = { id: "1", variantId: "1", properties: { foo: "bar" } };
			const attributes = { releaseId: "123", displayShipDates: "tomorrow" };

			const newItem = shopifyAJAXCart.addPreorderAttributes(item, attributes);

			expect(newItem.properties).toEqual({
				foo: "bar",
				__releaseId: "123",
				"Purple Dot Pre-order": "tomorrow",
			});
		});
	});

	describe("removePreorderAttributes", () => {
		test("adds attributes to the item properties", () => {
			const item = {
				id: "1",
				variantId: "1",
				properties: {
					foo: "bar",
					__releaseId: "123",
					"Purple Dot Pre-order": "tomorrow",
				},
			};

			const newItem = shopifyAJAXCart.removePreorderAttributes(item);

			expect(newItem.properties).toEqual({
				foo: "bar",
			});
		});
	});
});
