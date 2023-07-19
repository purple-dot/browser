import {
  connectToIframe,
  connectToParentPage,
} from './iframe-connect';

const HIDING_STYLE_ID_NAME = 'PD__overlay-hiding-style';
let scrollPositionBeforeOpened: number;

export function injectOverlayIframe({
  hostURL,
  id,
  src,
  dataset,
  dataRequestHandlers,
}: {
  hostURL: string;
  id: string;
  src: string;
  dataset?: Record<string, string>;
  dataRequestHandlers: Record<string, (data: any) => Promise<any>>
}) {
  // Create a new iframe
  const iframe = createScrimIframe({ id, src, dataset });
  document.body.appendChild(iframe);

  // Set the iframe to be invisible while its loaded
  // so we dont get a flash of white or block the page
  const style = document.createElement('style');
  style.id = HIDING_STYLE_ID_NAME;
  style.innerHTML = `#${id} { visibility: hidden; }`;
  document.head.appendChild(style);

  scrollPositionBeforeOpened = document.documentElement.scrollTop;

  return connectToIframe({ hostURL, iframe, dataRequestHandlers }).then(
    (childBridge: any) => {
      childBridge.on('dismiss-iframe', () => {
        iframe.style.display = 'none';
        enableParentPageScroll();
        window.scrollTo(0, scrollPositionBeforeOpened);
      });

      const elem = document.querySelector<HTMLScriptElement>(`#${HIDING_STYLE_ID_NAME}`);
      if (elem) {
        document.head.removeChild(elem);
      }

      iframe.contentWindow?.focus();
      disableParentPageScroll();

      return childBridge;
    }
  );
}

export function connectToOverlayParent(...args: any) {
  return connectToParentPage(...args).then((parentBridge: any) => ({
    ...parentBridge,
    dismissIframe: () => parentBridge.emit('dismiss-iframe'),
    navigateTo: (url: string) => parentBridge.emit('navigate-to', { url }),
  }));
}

export function openOverlayIframe({ id }: { id: string }) {
  const iframe = document.querySelector<HTMLIFrameElement>(`#${id}`);
  if (!iframe) {
    return;
  }

  iframe.style.display = 'block';

  iframe.contentWindow?.focus();
  disableParentPageScroll();
}

export function removeOverlayIframe(id: string) {
  const iframe = document.querySelector<HTMLIFrameElement>(`#${id}`);
  if (!iframe) {
    return;
  }

  iframe.parentNode?.removeChild(iframe);

  enableParentPageScroll();
  window.scrollTo(0, scrollPositionBeforeOpened);
}

function disableParentPageScroll() {
  injectNoScrollCSS();
  document.documentElement.classList.add('pd-disable-scroll');
  document.body.classList.add('pd-disable-scroll');
}

function enableParentPageScroll() {
  document.documentElement.classList.remove('pd-disable-scroll');
  document.body.classList.remove('pd-disable-scroll');
}

function injectNoScrollCSS() {
  const id = 'purple-dot-css';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = 'purple-dot-css';
    style.innerHTML = `
      .pd-disable-scroll {
        overflow: hidden !important;
        position: relative !important; /* Fixes an iOS Safari bug */
      }
    `;
    document.body.appendChild(style);
  }
}

function createScrimIframe({ id, src, dataset }: {
  id: string;
  src: string;
  dataset?: Record<string, string>
}) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('id', id);
  iframe.setAttribute('role', 'dialog');
  iframe.setAttribute('allowtransparency', 'true');
  iframe.setAttribute('src', src);

  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.height = '100%';
  iframe.style.width = '100%';
  iframe.style.zIndex = '2147483647';
  iframe.style.border = 'none';

  Object.entries(dataset || {}).forEach(([k, v]) => {
    iframe.dataset[k] = v;
  });

  return iframe;
}
