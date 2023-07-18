export declare global {
  interface Window {
    PurpleDotConfig?: {
      apiKey: string;
    };

    Shopify?: {
      shop?: string;
      routes?: {
        root?: string;
      };
    };
  }
}
