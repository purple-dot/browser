import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PurpleDotEvents } from "../custom-events";
import { EventForwarder } from "./event-forwarder";
import { AnalyticsProvider } from "./provider";

class MockProvider extends AnalyticsProvider {
	readonly name: string;

	private readonly enabled: boolean;

	protected handlers: Partial<{
		[K in keyof PurpleDotEvents]: (
			data: PurpleDotEvents[K],
		) => void | Promise<void>;
	}> = {};

	constructor(name: string, enabled: boolean) {
		super({});
		this.name = name;
		this.enabled = enabled;
	}

	isEnabled(): boolean {
		return this.enabled;
	}

	setHandler<K extends keyof PurpleDotEvents>(
		eventName: K,
		handler: (data: PurpleDotEvents[K]) => void | Promise<void>,
	): void {
		(
			this.handlers as Record<
				string,
				(data: PurpleDotEvents[K]) => void | Promise<void>
			>
		)[eventName] = handler;
	}
}

describe("EventForwarder", () => {
	let mockProvider1: MockProvider;
	let mockProvider2: MockProvider;
	let mockDisabledProvider: MockProvider;

	beforeEach(() => {
		mockProvider1 = new MockProvider("Provider1", true);
		mockProvider2 = new MockProvider("Provider2", true);
		mockDisabledProvider = new MockProvider("Provider3", false);

		vi.spyOn(mockProvider1, "track");
		vi.spyOn(mockProvider2, "track");
		vi.spyOn(mockDisabledProvider, "track");
	});

	it("should forward events to all enabled providers", () => {
		const forwarder = new EventForwarder([mockProvider1, mockProvider2]);

		const eventData: PurpleDotEvents["PreorderCreated"] = {
			reference: "REF123",
			email: "test@example.com",
			shippingAddress: {
				firstName: "John",
				lastName: "Doe",
				address1: "123 Main St",
				city: "New York",
				province: "NY",
				country: "US",
				zip: "10001",
			},
			lineItems: [
				{
					productId: "prod1",
					skuId: "sku1",
					name: "Product 1",
					sku: "SKU-001",
					price: { amount: 100, currency: "USD" },
					quantity: 2,
					purchaseType: "preorder",
				},
			],
			total: { amount: 200, currency: "USD" },
			shipping: { amount: 10 },
			tax: { amount: 15 },
			discountCode: "SAVE10",
		};

		forwarder.track("PreorderCreated", eventData);

		expect(mockProvider1.track).toHaveBeenCalledWith(
			"PreorderCreated",
			eventData,
		);
		expect(mockProvider2.track).toHaveBeenCalledWith(
			"PreorderCreated",
			eventData,
		);
	});

	it("should filter out disabled providers", () => {
		const forwarder = new EventForwarder([
			mockProvider1,
			mockProvider2,
			mockDisabledProvider,
		]);

		const eventData: PurpleDotEvents["AddToCart"] = {
			skuId: "123",
			internalSkuId: "456",
			releaseId: "789",
			price: { amount: 10, currency: "USD" },
			quantity: 1,
		};

		forwarder.track("AddToCart", eventData);

		expect(mockProvider1.track).toHaveBeenCalledWith("AddToCart", eventData);
		expect(mockProvider2.track).toHaveBeenCalledWith("AddToCart", eventData);
		expect(mockDisabledProvider.track).not.toHaveBeenCalled();
	});

	it("should handle no enabled providers", () => {
		const forwarder = new EventForwarder([mockDisabledProvider]);

		const eventData: PurpleDotEvents["AddToCart"] = {
			skuId: "123",
			internalSkuId: "456",
			releaseId: "789",
			price: { amount: 10, currency: "USD" },
			quantity: 1,
		};

		forwarder.track("AddToCart", eventData);

		expect(mockDisabledProvider.track).not.toHaveBeenCalled();
	});

	it("should handle provider errors gracefully", async () => {
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		mockProvider1.setHandler("AddToCart", () => {
			throw new Error("Provider error");
		});

		const forwarder = new EventForwarder([mockProvider1, mockProvider2]);

		const eventData: PurpleDotEvents["AddToCart"] = {
			skuId: "123",
			internalSkuId: "456",
			releaseId: "789",
			price: { amount: 10, currency: "USD" },
			quantity: 1,
		};

		await forwarder.track("AddToCart", eventData);

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			expect.stringContaining(
				"[PurpleDot] Failed to track AddToCart with Provider1",
			),
			expect.any(Error),
		);

		consoleErrorSpy.mockRestore();
	});

	it("should continue forwarding to other providers if one fails", async () => {
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		mockProvider1.setHandler("PreorderCancelled", () => {
			throw new Error("Provider 1 error");
		});

		mockProvider2.setHandler("PreorderCancelled", vi.fn());

		const forwarder = new EventForwarder([
			mockProvider1,
			mockProvider2,
			mockDisabledProvider,
		]);

		const eventData: PurpleDotEvents["PreorderCancelled"] = {
			preorderReference: "REF456",
		};

		await forwarder.track("PreorderCancelled", eventData);

		expect(consoleErrorSpy).toHaveBeenCalledWith(
			expect.stringContaining(
				"[PurpleDot] Failed to track PreorderCancelled with Provider1",
			),
			expect.any(Error),
		);
		expect(mockProvider2.track).toHaveBeenCalledWith(
			"PreorderCancelled",
			eventData,
		);

		consoleErrorSpy.mockRestore();
	});

	it("should track different event types correctly", () => {
		const forwarder = new EventForwarder([mockProvider1]);

		const checkoutLoadedData: PurpleDotEvents["CheckoutLoaded"] = {
			enableCombinedCart: true,
		};
		forwarder.track("CheckoutLoaded", checkoutLoadedData);
		expect(mockProvider1.track).toHaveBeenCalledWith(
			"CheckoutLoaded",
			checkoutLoadedData,
		);

		const readyData: PurpleDotEvents["Ready"] = {};
		forwarder.track("Ready", readyData);
		expect(mockProvider1.track).toHaveBeenCalledWith("Ready", readyData);
	});
});
