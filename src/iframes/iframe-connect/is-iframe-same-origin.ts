function isIframeSameOrigin(iframe: HTMLIFrameElement) {
  try {
    const srcOrigin = new URL(iframe.src).origin;
    return srcOrigin !== iframe.contentWindow?.origin;
  } catch (err) {
    return false;
  }
}

export default isIframeSameOrigin;
