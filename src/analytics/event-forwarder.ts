import type { PurpleDotEvents } from "../custom-events";
import type { AnalyticsProvider } from "./provider";

export class EventForwarder {
	private readonly providers: AnalyticsProvider[];

	constructor(availableProviders: AnalyticsProvider[]) {
		this.providers = availableProviders.filter((provider) =>
			provider.isEnabled(),
		);
	}

	async track<K extends keyof PurpleDotEvents>(
		eventName: K,
		eventData: PurpleDotEvents[K],
	): Promise<void> {
		await Promise.allSettled(
			this.providers.map((provider) => provider.track(eventName, eventData)),
		);
	}
}
