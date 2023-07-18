export type FetchParams = [input: string | URL, init?: RequestInit];
type JSONObject = { [key: string]: unknown };

type InterceptHandler<A> = (
  request: A,
  onComplete: Promise<void>,
) => Promise<A>;

export abstract class Interceptor<
  H extends InterceptHandler<Req>,
  Req = Parameters<H>[0],
> {
  private callbacks: H[] = [];

  addHandler(...cb: H[]) {
    this.callbacks.push(...cb);
  }

  protected async chainHandlers<R extends Parameters<H>>(...request: R) {
    let [newRequest] = request;
    const responsePromise = request[1];

    for await (const cb of this.callbacks) {
      newRequest = await cb(newRequest, responsePromise);
    }

    return newRequest;
  }
}

interface InterceptingXHR extends XMLHttpRequest {
  _pdOpenArgs?: Parameters<XMLHttpRequest["open"]>;
  _pdOpenIntercept?: Promise<void>;
  _pdRequestHeaders?: [string, string][];
}

function interceptFetch(shouldIntercept: InterceptPredicate, cb: Callback) {
  const origFetch = window.fetch;
  window.fetch = function fetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    try {
      let request: FetchParams;

      if (input instanceof Request) {
        request = [input.url, init];
      } else {
        request = [input, init];
      }

      if (shouldIntercept(...request)) {
        let resolveOnComplete: () => void;
        const onComplete = new Promise<void>((resolve) => {
          resolveOnComplete = resolve;
        });

        return cb(request, onComplete)
          .then((newRequest) =>
            origFetch(...newRequest).then((res) => {
              resolveOnComplete();
              return res;
            }),
          )
          .catch(() => origFetch(input, init)); // TODO: reject the onComplete Promise?
      }
    } catch (error) {
      console.error("PurpleDot Interceptor Error:", error);
    }

    return origFetch(input, init);
  };
}

function interceptXHR(shouldIntercept: InterceptPredicate, cb: Callback) {
  const origOpen = window.XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function open(
    this: InterceptingXHR,
    method: string,
    url: string | URL,
    async?: boolean,
    user?: string,
    password?: string,
  ) {
    // Setup some variables to store things in between calls
    this._pdOpenArgs = undefined;
    this._pdOpenIntercept = undefined;
    this._pdRequestHeaders = undefined;

    const pdOpen: Parameters<XMLHttpRequest["open"]> = [
      method,
      url,
      async ?? true,
      user,
      password,
    ];

    // Intercepting GET XHRs is possible but complicated.
    // If possible stores should be updated to use POST which is more correct anyway.
    if (method.toUpperCase() === "GET") {
      if (shouldIntercept(url, { method })) {
        console.warn(
          "Purple Dot Interceptors: GET XHRs are not fully supported.",
        );
      }
    }

    // We store the open args because we'll need them again when intercepting in send()
    this._pdOpenArgs = pdOpen;

    // For other methods we don't intercept until send() is called
    origOpen.apply(this, pdOpen);
  };

  const origSend = window.XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.send = function send(
    this: InterceptingXHR,
    body?: XMLHttpRequestBodyInit | null, // TODO: This can also be a Document
  ) {
    // _pdOpen is only set if the request might still need intercepting in send()
    if (this._pdOpenArgs != null) {
      const pdOpen = this._pdOpenArgs;

      try {
        const request: FetchParams = [
          pdOpen[1],
          {
            method: pdOpen[0],
            body,
          },
        ];

        if (shouldIntercept(...request)) {
          let resolveOnComplete: () => void;
          const onComplete = new Promise<void>((resolve) => {
            resolveOnComplete = resolve;
          });
          this.addEventListener("loadend", () => {
            resolveOnComplete();
          });

          cb(request, onComplete)
            .then(([input, init]) => {
              // TODO: Check that init has the same method as the original request
              pdOpen[1] = input.toString();

              // TODO: This can actually be a ReadableStream which XHR does not support.
              origSend.call(this, init?.body as XMLHttpRequestBodyInit);
            })
            .catch(() => {
              origSend.call(this, body);
              // TODO: reject the onComplete Promise?
            });

          return;
        }
      } catch (error) {
        console.error("PurpleDot Interceptor Error:", error);
      }
    }

    // If the open() interceptor is still running. Let it finish first.
    const XHR_READY_STATE_UNSENT = 0;
    if (
      this.readyState === XHR_READY_STATE_UNSENT &&
      this._pdOpenIntercept != null
    ) {
      this._pdOpenIntercept
        .then(() => {
          origSend.call(this, body);
        })
        .catch(() => {
          origSend.call(this, body);
        });
    } else {
      origSend.call(this, body);
    }
  };
}

export type Callback = (
  request: FetchParams,
  onComplete: Promise<void>,
) => Promise<FetchParams>;

export type InterceptPredicate = (
  input: string | URL,
  init?: RequestInit,
) => boolean;

export class RequestInterceptor extends Interceptor<Callback> {
  constructor(private predicate: InterceptPredicate) {
    super();

    const chain = this.chainHandlers.bind(this);

    interceptFetch(this.predicate, chain);
    interceptXHR(this.predicate, chain);
  }
}

export function parseRequestBody(
  init: RequestInit,
): FormData | URLSearchParams | JSONObject {
  if (typeof init.body === "string") {
    const headers = new Headers(init.headers);
    const contentType = headers.get("content-type");

    if (contentType === "application/json") {
      return JSON.parse(init.body);
    }

    if (contentType === "application/x-www-form-urlencoded") {
      return new URLSearchParams(init.body);
    }

    try {
      return JSON.parse(init.body);
    } catch {
      return new URLSearchParams(init.body);
    }
  }

  if (init.body instanceof FormData || init.body instanceof URLSearchParams) {
    return init.body;
  }

  // This could happen if they try to post a Blob, ReadableStream etc.
  // This seems fairly unlikely so we don't implement it.

  throw new TypeError("request body could not be parsed");
}

export function makeRequestBody(
  init: RequestInit,
  body: ReturnType<typeof parseRequestBody>,
): URLSearchParams | FormData | string {
  if (typeof init.body === "string" && typeof body !== "string") {
    if (body instanceof URLSearchParams || body instanceof FormData) {
      return body.toString();
    }
    return JSON.stringify(body);
  }

  if (
    body instanceof URLSearchParams ||
    body instanceof FormData ||
    typeof body === "string"
  ) {
    return body;
  }

  // This should really never happen since we decoded it in the first place.
  throw new Error(`unable to encode body: ${typeof body} ${body}`);
}

export function shopifyUrlStartsWith(url: URL | string, prefix: string) {
  const parsedURL = new URL(url, window.location.href);
  const shopifyRoot = window?.Shopify?.routes?.root ?? "/";

  return (
    parsedURL.pathname.startsWith(`/${prefix}`) ||
    parsedURL.pathname.startsWith(`${shopifyRoot}${prefix}`)
  );
}
