## API

```javascript
import { init } from '@purple-dot/browser';

init({
  apiKey: 'xxx',
});
```

### Purple Dot API

```javascript
import * as api from '@purple-dot/browser/api';

await api.fetchProductsPreorderState('test-product');

await api.fetchVariantsPreorderState(12345);
```

### Shopify AJAX Cart

```javascript
import { ShopifyAJAXCart } from '@purple-dot/browser/shopify-ajax-cart';
import { cartHasPreorderItem } from '@purple-dot/browser/cart';

await cartHasPreorderItem(ShopifyAJAXCart);
```

### Purple Dot Checkout

```javascript
import * as checkout from '@purple-dot/browser/checkout';
import { ShopifyAJAXCart } from '@purple-dot/browser/shopify-ajax-cart';

await checkout.open({
  cartId: await ShopifyAJAXCart.getCartId(),
});
```

### Shopify AJAX Cart Interceptors

```javascript
import * as interceptors from '@purple-dot/browser/shopify-ajax-interceptors';

interceptors.start();
```
