import { v4 as uuid } from 'uuid';
import isControllerMessage from './is-controller-message';
import ParentToChildBridge from './parent-to-child-bridge';
import ChildToParentBridge from './child-to-parent-bridge';
import isIframeSameOrigin from './is-iframe-same-origin';

export function connectToIframe({ iframe, hostURL, dataRequestHandlers }: {
  iframe: HTMLIFrameElement;
  hostURL: string;
  dataRequestHandlers?: any;
}) {
  let intervalId: number;
  const iframeId = uuid();

  // eslint-disable-next-line no-param-reassign
  iframe.src = `${iframe.src}#!iframeId=${iframeId}`;

  const connection = new Promise((resolve, reject) => {
    function reply(event: MessageEvent) {
      if (!isControllerMessage(event)) {
        return;
      }

      const { meta, data } = event.data;
      if (meta.sourceId !== iframeId) {
        return;
      }

      if (meta.messageType === 'handshake-reply') {
        clearInterval(intervalId);
        window.removeEventListener('message', reply, false);
        resolve(
          ParentToChildBridge({
            hostURL,
            iframeId,
            iframe,
            dataRequestHandlers,
          })
        );
      }

      if (meta.messageType === 'handshake-failed') {
        clearInterval(intervalId);
        window.removeEventListener('message', reply, false);

        const err = new Error('Handshake to iframe failed') as any;
        err.data = data;
        reject(err);
      }
    }

    window.addEventListener('message', reply, false);
  });

  // Emit handshake message when the iframe navigates to a
  // new page so the new page can emit messages to the parent
  iframe.addEventListener('load', () => {
    if (!iframe.src.includes('iframeId=')) {
      // eslint-disable-next-line no-param-reassign
      iframe.src = `${iframe.src}#!iframeId=${iframeId}`;
    }
    iframe.contentWindow?.postMessage(
      {
        meta: {
          messageType: 'handshake',
        },
        data: {
          iframeId,
        },
      },
      hostURL
    );
  });

  intervalId = setInterval(() => {
    // Because the iframe's origin is the same as the host page's until it
    // loads, postMesssage would log an error about mismatched origin. If we can
    // see that the origin is the same as the parent page, we dont try to post.
    if (isIframeSameOrigin(iframe)) {
      return;
    }

    // iframe has been removed from the page, stop trying the handshake
    if (!iframe.contentWindow) {
      clearInterval(intervalId);
      return;
    }

    iframe.contentWindow.postMessage(
      {
        meta: {
          messageType: 'handshake',
        },
        data: {
          iframeId,
        },
      },
      hostURL
    );
  }, 100);

  return connection;
}

export function connectToParentPage({ parentAccessibleData } :{ parentAccessibleData?: any } = {}) {
  return new Promise((resolve) => {
    function handshake(event: MessageEvent) {
      if (!isControllerMessage(event)) {
        return;
      }

      const { meta, data } = event.data;

      if (meta.messageType === 'handshake') {
        const { iframeId } = data;
        if (
          window.location.href.includes(`iframeId=${iframeId}`) ||
          !window.location.href.includes(`iframeId=`)
        ) {
          window.removeEventListener('message', handshake, false);

          const bridge = ChildToParentBridge({
            iframeId: data.iframeId,
            initialData: parentAccessibleData,
          });
          resolve(bridge);
        }
      }
    }

    window.addEventListener('message', handshake, false);
  });
}

/**
 *  failHandshake()
 *  Called from an error script served in the iframe
 */
export function failHandshake(errorData: any) {
  function handshake(event: MessageEvent) {
    if (!isControllerMessage(event)) {
      return;
    }

    const { meta, data } = event.data;
    if (meta.messageType === 'handshake') {
      window.removeEventListener('message', handshake, false);
      postHandshakeFailMessage(data.iframeId, errorData);
    }
  }

  window.addEventListener('message', handshake, false);
}

function postHandshakeFailMessage(iframeId: string, data: any) {
  window.parent.postMessage(
    {
      meta: {
        messageType: 'handshake-failed',
        sourceId: iframeId,
      },
      data,
    },
    '*'
  );
}
