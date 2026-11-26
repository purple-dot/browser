import { afterEach, describe, expect, test, vi } from "vitest";

import { addAttributes, ShopifyAJAXCart } from "../src/shopify-ajax-cart";

const shopifyAJAXCart = new ShopifyAJAXCart();

describe("cart quantity updates", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("writes separate updates for lines with the same variant", async () => {
		const items = [
			{ id: 123, key: "123:in-stock", variant_id: 123, quantity: 3 },
			{ id: 123, key: "123:preorder", variant_id: 123, quantity: 2 },
		];
		const fetchCart = vi
			.fn()
			.mockResolvedValueOnce(Response.json({ items }))
			.mockResolvedValueOnce(Response.json({ items }))
			.mockResolvedValueOnce(Response.json({}));
		vi.stubGlobal("fetch", fetchCart);

		const lines = await shopifyAJAXCart.fetchItems();
		await shopifyAJAXCart.updateQuantities([
			{ id: lines[0].id, quantity: 1 },
			{ id: lines[1].id, quantity: 0 },
		]);

		expect(fetchCart).toHaveBeenCalledTimes(3);
		expect(fetchCart).toHaveBeenNthCalledWith(2, "/cart.js");
		expect(fetchCart).toHaveBeenNthCalledWith(3, "/cart/update.js", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				updates: { "123:in-stock": 1, "123:preorder": 0 },
			}),
		});
	});

	test("decrements the line named by a key", async () => {
		const fetchCart = vi
			.fn()
			.mockResolvedValueOnce(
				Response.json({
					items: [
						{ id: 123, key: "123:in-stock", quantity: 3 },
						{ id: 123, key: "123:preorder", quantity: 2 },
					],
				}),
			)
			.mockResolvedValueOnce(Response.json({}));
		vi.stubGlobal("fetch", fetchCart);

		await shopifyAJAXCart.decrementQuantity("123:preorder");

		expect(fetchCart).toHaveBeenCalledTimes(2);
		expect(fetchCart).toHaveBeenNthCalledWith(1, "/cart.js");
		expect(fetchCart).toHaveBeenNthCalledWith(2, "/cart/update.js", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ updates: { "123:preorder": 1 } }),
		});
	});

	test("retains variant ID updates when a line has no key", async () => {
		const fetchCart = vi
			.fn()
			.mockResolvedValueOnce(
				Response.json({ items: [{ id: 123, quantity: 2 }] }),
			)
			.mockResolvedValueOnce(Response.json({}));
		vi.stubGlobal("fetch", fetchCart);

		await shopifyAJAXCart.updateQuantities([{ id: "123", quantity: 1 }]);

		expect(fetchCart).toHaveBeenNthCalledWith(2, "/cart/update.js", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ updates: { "123": 1 } }),
		});
	});

	test("does not write when the requested line is no longer in the cart", async () => {
		const fetchCart = vi
			.fn()
			.mockImplementation(async () => Response.json({ items: [] }));
		vi.stubGlobal("fetch", fetchCart);

		await shopifyAJAXCart.decrementQuantity("123:removed");
		await shopifyAJAXCart.updateQuantities([
			{ id: "123:removed", quantity: 2 },
		]);

		expect(fetchCart.mock.calls).toEqual([["/cart.js"], ["/cart.js"]]);
	});
});

describe("fetch", () => {
	describe("hasPreorderAttributes", () => {
		test("returns true if the item has a __releaseId property", () => {
			const item = addAttributes({
				id: "1",
				variantId: "1",
				properties: { __releaseId: "123" },
				quantity: 1,
			});
			expect(shopifyAJAXCart.hasPreorderAttributes(item)).toBe(true);
		});

		test("returns false if the item does not have a __releaseId property", () => {
			const item = addAttributes({
				id: "1",
				variantId: "1",
				properties: { foo: "bar" },
				quantity: 1,
			});
			expect(shopifyAJAXCart.hasPreorderAttributes(item)).toBe(false);
		});
	});

	describe("addPreorderAttributes", () => {
		test("adds attributes to the item properties", () => {
			const item = addAttributes({
				id: "1",
				variantId: "1",
				properties: { foo: "bar" },
				quantity: 1,
			});
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
			const item = addAttributes({
				id: "1",
				variantId: "1",
				properties: {
					foo: "bar",
					__releaseId: "123",
					"Purple Dot Pre-order": "tomorrow",
				},
				quantity: 1,
			});

			const newItem = shopifyAJAXCart.removePreorderAttributes(item);

			expect(newItem.properties).toEqual({
				foo: "bar",
			});
		});
	});
});
