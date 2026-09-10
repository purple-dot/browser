import { beforeEach, describe, expect, it, vi } from "vitest";
import createFetchMock from "vitest-fetch-mock";
import { init } from "../src";
import { availability } from "../src/availability";

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

beforeEach(() => {
	init({
		apiKey: "123",
	});
});

describe("availability", () => {
	describe("when the product is in stock", () => {
		it("should return AVAILABLE_IN_STOCK", async () => {
			const state = await availability({ variantId: "123" }, () =>
				Promise.resolve(true),
			);
			expect(state).toEqual({ state: "AVAILABLE_IN_STOCK", available: true });
		});
	});

	describe("when the product is sold out", () => {
		beforeEach(() => {
			fetchMocker.mockResponse(
				JSON.stringify({
					data: {
						state: "SOLD_OUT",
					},
				}),
			);
		});

		it("should return SOLD_OUT", async () => {
			const state = await availability({ variantId: "123" }, () =>
				Promise.resolve(false),
			);
			expect(state).toEqual({ state: "SOLD_OUT" });
		});
	});

	describe("when the product is on preorder", () => {
		beforeEach(() => {
			fetchMocker.mockResponse(
				JSON.stringify({
					data: {
						state: "ON_PREORDER",
						waitlist: {
							id: "123",
							selling_plan_id: "456",
							display_dispatch_date: "2025-01-01",
							units_left: 10,
						},
					},
				}),
			);
		});

		it("should return ON_PREORDER", async () => {
			const state = await availability({ variantId: "123" }, () =>
				Promise.resolve(false),
			);
			expect(state).toEqual({
				state: "ON_PREORDER",
				waitlist: {
					id: "123",
					selling_plan_id: "456",
					display_dispatch_date: "2025-01-01",
					units_left: 10,
				},
			});
		});
	});

	describe("when the product is not in stock but our api says that it is", () => {
		beforeEach(() => {
			fetchMocker.mockResponse(
				JSON.stringify({
					data: {
						state: "AVAILABLE_IN_STOCK",
						waitlist: {
							id: "123",
							selling_plan_id: "456",
							display_dispatch_date: "2025-01-01",
							units_left: 10,
						},
					},
				}),
			);
		});

		it("should return ON_PREORDER", async () => {
			const state = await availability({ variantId: "123" }, () =>
				Promise.resolve(false),
			);
			expect(state).toEqual({
				state: "ON_PREORDER",
				waitlist: {
					id: "123",
					selling_plan_id: "456",
					display_dispatch_date: "2025-01-01",
					units_left: 10,
				},
			});
		});
	});

	describe("when a country is provided", () => {
		beforeEach(() => {
			fetchMocker.resetMocks();
			fetchMocker.mockResponse(
				JSON.stringify({
					data: {
						state: "SOLD_OUT",
					},
				}),
			);
		});

		it("passes country through to the variant preorder state API", async () => {
			await availability({ variantId: "123", country: "GB" }, () =>
				Promise.resolve(false),
			);

			expect(fetchMocker).toHaveBeenCalledWith(
				"https://www.purpledotprice.com/api/v1/variants/preorder-state?api_key=123&variant_id=123&country=GB",
			);
		});

		it("passes country through to the product preorder state API", async () => {
			await availability(
				{ productHandle: "the-complete-snowboard", country: "US" },
				() => Promise.resolve(false),
			);

			expect(fetchMocker).toHaveBeenCalledWith(
				"https://www.purpledotprice.com/api/v1/products/preorder-state?api_key=123&handle=the-complete-snowboard&country=US",
			);
		});
	});
});
