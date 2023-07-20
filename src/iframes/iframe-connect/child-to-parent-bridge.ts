import messageHandler from "./message-handler";

function ChildToParentBridge({
  iframeId,
  initialData = {},
}: {
  iframeId: string;
  initialData?: Record<string, Object>;
}) {
  const postParentMessage = createPostFn(iframeId);

  postParentMessage("handshake-reply");

  window.addEventListener(
    "message",
    messageHandler("data-request", ({ data }) => {
      postParentMessage("data-reply", {
        [data.key]: initialData[data.key],
      });
    }),
  );

  return {
    emit: (eventName: string, data: Record<string, Object>) => {
      postParentMessage("event", { eventName, eventData: data });
    },
    get: (key: string) =>
      new Promise((resolve) => {
        const dataReply = messageHandler("data-reply", ({ data }) => {
          window.removeEventListener("message", dataReply, false);
          resolve((data as Record<string, Object>)[key]);
        });

        window.addEventListener("message", dataReply, false);

        postParentMessage("data-request", { key });
      }),
  };
}

function createPostFn(iframeId: string) {
  return (messageType: string, data?: Record<string, Object>) => {
    window.parent.postMessage(
      {
        meta: {
          messageType,
          sourceId: iframeId,
        },
        data: data || {},
      },
      "*",
    );
  };
}

export default ChildToParentBridge;
