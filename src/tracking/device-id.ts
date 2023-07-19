import { v4 as uuid } from "uuid";
import cookies from "js-cookie";
import * as SessionStorage from "./session-storage";

const COOKIE_NAME = "_pddid";

function getDeviceId() {
  const cookieDeviceId = getDeviceIdCookie();
  if (cookieDeviceId) {
    return { deviceId: cookieDeviceId, storage: "cookie" };
  }

  const sessionDeviceId = getDeviceIdSessionStorage();
  if (sessionDeviceId) {
    return { deviceId: sessionDeviceId, storage: "sessionstorage" };
  }

  const memoryDeviceId = getDeviceIdMemory();
  return { deviceId: memoryDeviceId, storage: "memory" };
}

function getDeviceIdCookie() {
  let deviceId = cookies.get(COOKIE_NAME);
  if (deviceId) {
    return deviceId;
  }

  deviceId = uuid();
  cookies.set(COOKIE_NAME, deviceId, {
    expires: 365,
    secure: true,
    sameSite: "Strict",
  });

  // Check that we can read the cookie back - if it is blocked, return null and
  // fall back to session storage
  if (cookies.get(COOKIE_NAME)) {
    return deviceId;
  }
  return null;
}

function getDeviceIdSessionStorage() {
  let deviceId = SessionStorage.getItem(COOKIE_NAME);
  if (deviceId) {
    return deviceId;
  }
  deviceId = uuid();
  SessionStorage.setItem(COOKIE_NAME, deviceId);

  // Read value back to check if it was successfully persisted
  return SessionStorage.getItem(COOKIE_NAME);
}

const deviceIdMem = uuid();

function getDeviceIdMemory() {
  return deviceIdMem;
}

export default getDeviceId;
