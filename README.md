# @purple-dot/browser

This package is a toolbox for connecting your headless ecommerce application to Purple Dot. It provides all the features necessary for your integration, including APIs, cart & checkout functionality, and interceptors.

Please see [related documentation](http://bit.ly/47JtIk0) to learn more.

#

## API

```javascript
import { init } from '@purple-dot/browser';
import { ShopifyAJAXCart } from '@purple-dot/browser/shopify-ajax-cart';

init({
  apiKey: 'xxx',
  cartAdapter: new ShopifyAJAXCart(),
});
```

### Purple Dot API

```javascript
import * as api from '@purple-dot/browser/api';

await api.fetchProductsPreorderState('test-product');

await api.fetchVariantsPreorderState(12345);
```

### Cart

```javascript
import { cartHasPreorderItem } from '@purple-dot/browser/cart';

await cartHasPreorderItem();
```

### Purple Dot Checkout

```javascript
import * as checkout from '@purple-dot/browser/checkout';

await checkout.open();
```

### Shopify AJAX Cart Interceptors

```javascript
import * as interceptors from '@purple-dot/browser/shopify-ajax-interceptors';

interceptors.start();
```
