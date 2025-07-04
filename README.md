# @purple-dot/browser

This package is a toolbox for connecting your headless e-commerce application to Purple Dot. It provides all the features necessary for your integration, including APIs, cart & checkout functionality, and interceptors.

While the examples often refer to Shopify it is designed to support a wide range of stores.

Please see [related documentation](http://bit.ly/47JtIk0) to learn more.

You can find examples based on this code in [purple-dot/browser-examples](https://github.com/purple-dot/browser-examples).

## Setup

```javascript
import { init } from '@purple-dot/browser';
import { ShopifyAJAXCart } from '@purple-dot/browser/shopify-ajax-cart';
import { shopifyInStockAvailability } from '@purple-dot/browser/shopify-in-stock-availability';

init({
  apiKey: 'Your API Key',
});
```

### Availability

This allows you to tell the current availability state for an item so you can tell if the item is in stock, sold out or on preorder.

```javascript
import { availability } from '@purple-dot/browser/availability';

async function inStockInMyStore(variantId) {
    const response = await fetch(`/your/api/product.json?variant=${variantId}`);
    const data = response.json();
    
    return data.quantity;
}

const preorderState = await availability(variant.id, inStockInMyStore);
```

### Checkout

These allow you to interact with the various styles of Purple Dot checkout.

```javascript
import * as checkout from '@purple-dot/browser/checkout';

await checkout.open();

await checkout.openExpressCheckout(...);

await checkout.addItem(...);
```


### Cart

These allow you to integrate between your normal native cart and Purple Dot when using combined checkouts.

```javascript
import { cartHasPreorderItem } from '@purple-dot/browser/cart';

await cartHasPreorderItem();
```

### Shopify AJAX Cart Interceptors

These are a specialised middleware that intercept fetch and XHR requests to the Shopify cart APIs and automatically add the required additional metadata to work with Purple Dot.

```javascript
import * as interceptors from '@purple-dot/browser/shopify-ajax-interceptors';

interceptors.start();
```

### Low level API

```javascript
import * as api from '@purple-dot/browser/api';

const variantState =  await api.fetchVariantsPreorderState(12345);

const productState = await api.fetchProductsPreorderState('test-product');
```