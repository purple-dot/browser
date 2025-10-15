import type { PurpleDotEvents } from "../custom-events";
import type { EventForwardingConfig } from "./config";

export type EventHandlersMap = Partial<{
	[K in keyof PurpleDotEvents]: (
		data: PurpleDotEvents[K],
	) => void | Promise<void>;
}>;

export abstract class AnalyticsProvider {
	abstract readonly name: string;

	abstract isEnabled(): boolean;

	protected abstract handlers: EventHandlersMap;

	constructor(protected readonly config: EventForwardingConfig) {}

	async track<K extends keyof PurpleDotEvents>(
		eventName: K,
		eventData: PurpleDotEvents[K],
	): Promise<void> {
		const handler = this.handlers[eventName];
		if (!handler) {
			return;
		}

		try {
			await handler(eventData);
		} catch (error) {
			console.error(
				`[PurpleDot] Failed to track ${String(eventName)} with ${this.name}:`,
				error,
			);
		}
	}
}
