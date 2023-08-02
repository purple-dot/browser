import { describe, test } from "vitest";

import { init } from "../src/index";
import { ShopifyAJAXCart } from "../src/shopify-ajax-cart";
import { ShopifyStorefrontCart } from "../src/shopify-storefront-cart";

describe("passing cartAdapter to init()", () => {
  test("can initialise it with a ShopifyAJACCart", () => {
    init({
      apiKey: "123",
      cartAdapter: new ShopifyAJAXCart(),
    });
  });

  test("can initialise it with a ShopifyStorefrontCart", () => {
    init({
      apiKey: "123",
      cartAdapter: new ShopifyStorefrontCart(
        "test-store.myshopify.com",
        "shpat_1234",
      ),
    });
  });
});
