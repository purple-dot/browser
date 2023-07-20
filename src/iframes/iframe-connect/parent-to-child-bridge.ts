import messageHandler from "./message-handler";

export type DataRequestHandlers = Record<
  string,
  () => Promise<Record<string, Object>>
>;

function ParentToChildBridge({
  hostURL,
  iframeId,
  iframe,
  dataRequestHandlers = {},
}: {
  hostURL: string;
  iframeId: string;
  iframe: HTMLIFrameElement;
  dataRequestHandlers?: DataRequestHandlers;
}) {
  const listeners: Record<
    string,
    ((data: Record<string, Object> | string | number) => void)[]
  > = {};
  const postChildMessage = createPostFn({ iframe, hostURL });

  window.addEventListener(
    "message",
    messageHandler("event", ({ meta, data }) => {
      if (meta.sourceId === iframeId) {
        const callbacks = listeners[data.eventName];
        if (callbacks) {
          callbacks.forEach((callback) => {
            callback(data.eventData);
          });
        }
      }
    }),
  );

  window.addEventListener(
    "message",
    messageHandler("data-request", ({ data }) => {
      const handler = dataRequestHandlers[data.key];
      if (handler) {
        Promise.resolve(handler())
          .then((result) => {
            postChildMessage("data-reply", {
              [data.key]: result,
            });
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }),
  );

  return {
    on: (
      name: string,
      cb: (data?: Record<string, Object> | string | number) => void,
    ) => {
      if (listeners[name]) {
        listeners[name].push(cb);
      } else {
        listeners[name] = [cb];
      }
    },

    get: (key: string) =>
      new Promise((resolve) => {
        const dataReply = messageHandler("data-reply", ({ data }) => {
          window.removeEventListener("message", dataReply, false);
          resolve((data as Record<string, Object>)[key]);
        });

        window.addEventListener("message", dataReply, false);

        postChildMessage("data-request", { key });
      }),
  };
}

function createPostFn({
  iframe,
  hostURL,
}: { iframe: HTMLIFrameElement; hostURL: string }) {
  return (messageType: string, data: Record<string, Object>) => {
    iframe.contentWindow?.postMessage(
      {
        meta: {
          messageType,
        },
        data: data || {},
      },
      hostURL,
    );
  };
}

export default ParentToChildBridge;
