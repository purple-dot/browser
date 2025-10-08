/**
 * Configuration for event forwarding to third-party analytics providers.
 * Duplicates the {@link https://github.com/purple-dot/purple-dot/blob/master/packages/shopify-script/src/event-forwarding.ts | EventForwardingConfig} interface in shopify-script.
 */
export interface EventForwardingConfig {
	facebookPixel?: boolean;
	googleAdsTag?: {
		sendTo: string;
	};
	googleTag?: {
		sendTo: string;
	};
	gtmDataLayer?: boolean;
	googleAnalytics?: boolean;
	klaviyo?: boolean;
	tikTokPixel?: boolean;
	yotpo?: boolean;
	northbeamPixel?: boolean;
}
