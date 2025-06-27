import { trackEvent } from "./track-event";

async function trackPageView() {
	await trackEvent("page_view");
}

export { trackEvent, trackPageView };
