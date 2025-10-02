import type { PurpleDotEvents } from "../custom-events";

export abstract class AnalyticsProvider {
  abstract readonly name: string;

  abstract isEnabled(): boolean;

  protected abstract handlers: Partial<{
    [K in keyof PurpleDotEvents]: (data: PurpleDotEvents[K]) => void | Promise<void>;
  }>;

  track<K extends keyof PurpleDotEvents>(
    eventName: K,
    eventData: PurpleDotEvents[K],
  ): void | Promise<void> {
    const handler = this.handlers[eventName];
    if (handler) {
      const result = handler(eventData);
      if (result instanceof Promise) {
        return result.catch((error) => {
          console.error(
            `Purple Dot: Failed to track ${String(eventName)} with ${this.name}:`,
            error,
          );
        });
      }
      return result;
    }
  }
}
