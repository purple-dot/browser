function safeGetSessionStorage(): Storage | undefined {
  try {
    return window?.sessionStorage;
  } catch (err) {
    // Catch a SecurityError that is thrown if the browser has disabled access
    // to session storage
    return undefined;
  }
}

// rome-ignore lint/suspicious/noExplicitAny: any is the right type here
type AnyJSON = any;

export function getItem(key: string): AnyJSON {
  const storage = safeGetSessionStorage();
  if (!storage) {
    return undefined;
  }

  const str = storage.getItem(key);
  return str ? JSON.parse(str) : str;
}

export function setItem(key: string, value: AnyJSON): void {
  const storage = safeGetSessionStorage();
  if (!storage) {
    return;
  }

  const stringToStore = JSON.stringify(value);
  storage.setItem(key, stringToStore);
}

export function removeItem(key: string): void {
  const storage = safeGetSessionStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(key);
}
