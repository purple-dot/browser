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

### Shopify AJAX Cart Interceptors

```javascript
import * as interceptors from '@purple-dot/browser/shopify-cart-interceptors';

interceptors.start();
```
