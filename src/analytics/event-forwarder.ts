import type { PurpleDotEvents } from "../custom-events";
import type { AnalyticsProvider } from "./provider";

export class EventForwarder {
  private providers: AnalyticsProvider[] = [];

  constructor(availableProviders: AnalyticsProvider[]) {
    this.providers = availableProviders.filter((provider) =>
      provider.isEnabled(),
    );
  }

  track<K extends keyof PurpleDotEvents>(
    eventName: K,
    eventData: PurpleDotEvents[K],
  ): void {
    for (const provider of this.providers) {
      try {
        const result = provider.track(eventName, eventData);
        if (result instanceof Promise) {
          result.catch((error) => {
            this.handleError(error, eventName, provider);
          });
        }
      } catch (error) {
        this.handleError(error, eventName, provider);
      }
    }
  }

  private handleError(
    error: unknown,
    eventName: string,
    provider: AnalyticsProvider,
  ) {
    console.error(
      `Purple Dot: Failed to track ${eventName} with ${provider.name}:`,
      error,
    );
  }
}
