function isControllerMessage(event: MessageEvent) {
  const message = event.data;
  return message?.meta && message.data;
}

export default isControllerMessage;
