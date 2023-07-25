import { injectComponentScripts } from "./web-components";
import { trackPageView } from "./tracking";
import { onDOMContentLoaded, onLocationChange } from "./custom-events";

export interface PurpleDotConfig {
  apiKey: string;
}

export function init(config: PurpleDotConfig) {
  window.PurpleDotConfig = {
    apiKey: config.apiKey,
  };

  injectComponentScripts();
}

onDOMContentLoaded(() => trackPageView().catch(() => {}));
onLocationChange(() => trackPageView().catch(() => {}));
