import type { EventForwardingConfig } from "./config";
import { EventForwarder } from "./event-forwarder";
import { FacebookPixelProvider } from "./providers/facebook-pixel";
import { GoogleAdsProvider } from "./providers/google-ads";
import { GoogleAnalyticsProvider } from "./providers/google-analytics";
import { GoogleTagManagerProvider } from "./providers/google-tag-manager";
import { NorthbeamProvider } from "./providers/northbeam";
import { TikTokPixelProvider } from "./providers/tiktok-pixel";
import { YotpoProvider } from "./providers/yotpo";

export function setupAnalytics(config: EventForwardingConfig) {
  return new EventForwarder([
    new GoogleAdsProvider(config),
    new FacebookPixelProvider(config),
    new GoogleTagManagerProvider(config),
    new GoogleAnalyticsProvider(config),
    new TikTokPixelProvider(config),
    new YotpoProvider(config),
    new NorthbeamProvider(config),
  ]);
}

export { EventForwarder, type EventForwardingConfig }
