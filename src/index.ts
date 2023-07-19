import { injectComponentScripts } from "./web-components";
import { trackPageView } from "./tracking";

export interface PurpleDotConfig {
  apiKey: string;
}

export function init(config: PurpleDotConfig) {
  window.PurpleDotConfig = {
    apiKey: config.apiKey,
  };

  injectComponentScripts();
}

function onDOMContentLoaded(cb: () => {}) {
  if (document.readyState === "loading") {
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", cb);
  } else {
    // `DOMContentLoaded` has already fired
    cb();
  }
}

onDOMContentLoaded(() => trackPageView().catch(() => {}));
