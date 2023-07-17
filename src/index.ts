import { injectComponentScripts } from './web-components';

export interface PurpleDotConfig {
    apiKey: string;
}

export function init(config: PurpleDotConfig) {
    window.PurpleDotConfig = {
        apiKey: config.apiKey,
    };

    injectComponentScripts();
}
