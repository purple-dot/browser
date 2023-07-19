
import { beforeEach, describe, expect, test, vi } from "vitest";


import ShopifyCart from '../src/shopify-cart'

describe("fetch", () => {
  describe('hasPreorderAttributes', () => {
    test('returns true if the item has a __releaseId property', () => {
      const item = { variantId: '1', properties: { __releaseId: '123' } };
      expect(ShopifyCart.hasPreorderAttributes(item)).toBe(true);
    });

    test('returns false if the item does not have a __releaseId property', () => {
      const item = { variantId: '1', properties: { foo: 'bar' } };
      expect(ShopifyCart.hasPreorderAttributes(item)).toBe(false);
    });
  });

  describe('addPreorderAttributes', () => {
    test('adds attributes to the item properties', () => {
      const item = { variantId: '1', properties: { foo: 'bar' } };
      const attributes = { releaseId: '123', displayShipDates: 'tomorrow' };

      const newItem = ShopifyCart.addPreorderAttributes(item, attributes);

      expect(newItem.properties).toEqual({
        foo: 'bar',
        __releaseId: '123',
        'Purple Dot Pre-order': 'tomorrow',
      });
    });
  });

  describe('removePreorderAttributes', () => {
    test('adds attributes to the item properties', () => {
      const item = {
        variantId: '1', properties: {
          foo: 'bar', __releaseId: '123',
          'Purple Dot Pre-order': 'tomorrow',
        }
      };

      const newItem = ShopifyCart.removePreorderAttributes(item);

      expect(newItem.properties).toEqual({
        foo: 'bar'
      });
    });
  });
});
