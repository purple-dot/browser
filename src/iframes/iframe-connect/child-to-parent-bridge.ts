import messageHandler from './message-handler';

function ChildToParentBridge({ iframeId, initialData = {} }: {
  iframeId: string;
  initialData?: any;
}) {
  const postParentMessage = createPostFn(iframeId);

  postParentMessage('handshake-reply');

  window.addEventListener(
    'message',
    messageHandler('data-request', ({ data }) => {
      postParentMessage('data-reply', {
        [data.key]: initialData[data.key],
      });
    })
  );

  return {
    emit: (eventName: string, data: any) => {
      postParentMessage('event', { eventName, eventData: data });
    },
    get: (key: string) =>
      new Promise((resolve) => {
        const dataReply = messageHandler('data-reply', ({ data }) => {
          window.removeEventListener('message', dataReply, false);
          resolve(data[key]);
        });

        window.addEventListener('message', dataReply, false);

        postParentMessage('data-request', { key });
      }),
  };
}

function createPostFn(iframeId: string) {
  return (messageType: string, data?: any) => {
    window.parent.postMessage(
      {
        meta: {
          messageType,
          sourceId: iframeId,
        },
        data: data || {},
      },
      '*'
    );
  };
}

export default ChildToParentBridge;
