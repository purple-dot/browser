import { injectOverlayIframe } from './iframes/overlay-manager';

/**
 * CoordinatorIframe
 *
 * Loaded on the cart page to provide
 * a page for us to call our checkout from our domain
 * as not to need to expose the checkout with cors
 */
export class Checkout {
  iframe?: HTMLIFrameElement;

  constructor(private hostURL: string, private apiKey: string) {}

  iframeURL() {
    return createURL({
      host: this.hostURL,
      path: '/embedded-checkout/combined-checkout',
      queryParams: {
        apiKey: this.apiKey,
      },
    });
  }

  mount({ id }: { 
    id: string;
  }) {
    injectOverlayIframe({
      id: 'checkout-iframe',
      hostURL: this.hostURL,
      src: this.iframeURL(),
      dataRequestHandlers: {
        clearCart: async () => {
          // TODO: await ShopifyBehaviour.clearCart();
        },
      },
    }).then(() => {
      this.iframe?.contentWindow?.postMessage(
        {
          meta: {
            type: 'ITEMS',
          },
          data: {
            id,
          },
        },
        this.hostURL
      );
    });

    const checkoutIframe = document.querySelector<HTMLIFrameElement>('#checkout-iframe');
    if (!checkoutIframe) {
      return;
    }

    checkoutIframe.style.visibility = 'visible';
    checkoutIframe.style.background = 'white';
    this.iframe = checkoutIframe;

    window.addEventListener('message', async (message) => {
      if (message.origin !== this.hostURL) {
        return;
      }

      const { meta, data } = message.data;
      if (meta && meta.type === 'remove-line-item') {
        // TODO: await ShopifyBehaviour.removeLineItems(data.externalVariantIds);

        /**
         * TODO: Temporary solution to handle removed line items
         * where the cart is given to us with extra information we
         * cant process
         */
        window.location.reload();
      } else if (meta && meta.type === 'redirect-to-checkout') {
        window.location.href = '/checkout';
      }
    });
  }
}

export function createURL({
  host,
  path,
  queryParams,
  hash,
}: {
  host: string;
  path: string;
  queryParams: Record<string, any>;
  hash?: string;
}) {
  const url = new URL(`${host}${path}`);

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (typeof value === 'object') {
      url.searchParams.set(key, JSON.stringify(value));
    } else {
      url.searchParams.set(key, value);
    }
  });

  if (hash) {
    url.hash = hash;
  }

  return url.toString();
}
