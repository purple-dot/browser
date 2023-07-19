import { v4 as uuid } from "uuid";
import cookies from "js-cookie";
import * as SessionStorage from "./session-storage";
import getDeviceId from "./device-id";

export async function trackEvent(
  name: string,
  attrs: Record<string, string> = {},
) {
  const { deviceId, storage } = getDeviceId();
  const cartToken = cookies.get("cart") ?? null;
  const event = {
    id: uuid(),
    name,
    attrs: {
      deviceIdPersistent: storage === "cookie",
      deviceIdStorage: storage,
      cartToken,
      ...attrs,
    },
    deviceId,
    clientTimestamp: Date.now(),
    clientSequence: getAndIncrementSequenceNumber(),
    url: window.location.href,
    referrer: window.document.referrer,
  };
  const trackRequest = fetch("https://www.purpledotprice.com/api/v1/track", {
    method: "POST",
    body: JSON.stringify(event),
    mode: "cors",
    keepalive: true,
    headers: new Headers({
      Accept: "application/json",
      "Content-Type": "application/json",
    }),
  });

  try {
    await trackRequest;
  } catch (error) {
    if (error instanceof TypeError) {
      // This was some sort of network error. Just ignore it.
    } else {
      throw error;
    }
  }
}

function getAndIncrementSequenceNumber() {
  const key = "_pdts";
  const sequenceNumber = SessionStorage.getItem(key) || 0;
  SessionStorage.setItem(key, sequenceNumber + 1);
  return sequenceNumber;
}
