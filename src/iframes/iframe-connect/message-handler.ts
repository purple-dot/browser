import isControllerMessage from "./is-controller-message";

function messageHandler(
  messageType: string,
  callback: ({
    meta,
    data,
  }: {
    meta: Record<string, Object>;
    data: {
      key: string;
      eventName: string;
      eventData: Record<string, Object> | string | number;
    };
  }) => void,
) {
  return (event: MessageEvent) => {
    if (!isControllerMessage(event)) {
      return;
    }
    const { meta, data } = event.data;
    if (meta.messageType === messageType) {
      callback({ meta, data });
    }
  };
}

export default messageHandler;
