// @vitest-environment jsdom

import { beforeEach, describe, expect, test, vi } from "vitest";

import { ShopifyCartAddInterceptor } from "../src/shopify-cart-interceptors";

const jsonHeader = { "Content-Type": "application/json" };
const formHeader = { "Content-Type": "application/x-www-form-urlencoded" };

describe("ShopifyAddToCartInterceptor", () => {
  let fetchSpy;

  beforeEach(() => {
    window.fetch = fetchSpy = vi.fn(() => Promise.resolve(new Response()));
  });

  describe("AJAX request", () => {
    test("not on preorder", async () => {
      new ShopifyCartAddInterceptor();

      await window.fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: 1 }],
        }),
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/variants/preorder-state?variant_id=1"),
        undefined,
      );

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/cart/add.js"),
        {
          body: '{"items":[{"id":1}]}',
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      );
    });

    test("on preorder", async () => {
      fetchSpy.mockImplementation(async (input: string, init) => {
        if (input.endsWith("/api/v1/variants/preorder-state?variant_id=1")) {
          return new Response(
            JSON.stringify({
              data: {
                state: "ON_PREORDER",
                waitlist: { id: 123, display_dispatch_date: "tomorrow" },
              },
            }),
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
        } else {
          return new Response();
        }
      });

      new ShopifyCartAddInterceptor();

      await window.fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ id: 1 }],
        }),
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/variants/preorder-state?variant_id=1"),
        undefined,
      );

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/cart/add.js"),
        {
          body: '{"items":[{"properties":{"__releaseId":123,"Purple Dot Pre-order":"tomorrow"}}]}',
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        },
      );
    });
  });

  describe("Form request", () => {
    test("not on preorder", async () => {
      new ShopifyCartAddInterceptor();

      await window.fetch("/cart/add", {
        method: "POST",
        headers: formHeader,
        body: "id=1",
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/variants/preorder-state?variant_id=1"),
        undefined,
      );

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/cart/add"),
        {
          body: "id=1",
          headers: formHeader,
          method: "POST",
        },
      );
    });

    test("on preorder", async () => {
      fetchSpy.mockImplementation(async (input: string, init) => {
        if (input.endsWith("/api/v1/variants/preorder-state?variant_id=1")) {
          return new Response(
            JSON.stringify({
              data: {
                state: "ON_PREORDER",
                waitlist: { id: 123, display_dispatch_date: "tomorrow" },
              },
            }),
            {
              headers: jsonHeader,
            },
          );
        } else {
          return new Response();
        }
      });

      new ShopifyCartAddInterceptor();

      await window.fetch("/cart/add.js", {
        method: "POST",
        headers: formHeader,
        body: "id=1",
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/variants/preorder-state?variant_id=1"),
        undefined,
      );

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/cart/add.js"),
        {
          body: "id=1&quantity=1&properties%5B__releaseId%5D=123&properties%5BPurple+Dot+Pre-order%5D=tomorrow",
          headers: formHeader,
          method: "POST",
        },
      );
    });
  });
});
