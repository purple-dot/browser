import { PD_HOST_URL } from "./api";
import { getConfig } from "./config";

export function injectComponentScripts() {
	const webComponents = [
		"learn-more",
		"checkout",
		"self-service",
		"separate-bag",
		"express-payment-confirmation",
	];

	webComponents.forEach((component) => {
		injectScriptOnce(
			makeScriptTag({
				id: `pd-${component}-script`,
				src: `${PD_HOST_URL}/api/v1/${component}.js`,
			}),
		);
	});

	initExpressPaymentConfirmation();
}

type Callback = () => void;

const callbacks: Record<string, Callback[] | "loaded"> = {};

export function onceCheckoutScriptLoaded(cb: Callback) {
	onceScriptLoaded("pd-checkout-script", cb);
}

function onceScriptLoaded(id: string, cb: Callback) {
	if (callbacks[id] === "loaded") {
		cb();
	} else {
		if (Array.isArray(callbacks[id])) {
			(callbacks[id] as Callback[]).push(cb);
		} else {
			callbacks[id] = [cb];
		}
	}
}

function onScriptLoaded(el: HTMLScriptElement) {
	return () => {
		if (el.id in callbacks && Array.isArray(callbacks[el.id])) {
			for (const cb of callbacks[el.id] as Callback[]) {
				cb();
			}
		}
		callbacks[el.id] = "loaded";
	};
}

function injectScriptOnce(el: HTMLScriptElement) {
	if (!document.getElementById(el.id)) {
		el.addEventListener("load", onScriptLoaded(el));
		document.head.append(el);
	}
}

function makeScriptTag({ id, src }: { id: string; src: string }) {
	const script = document.createElement("script");
	script.id = id;
	script.src = src;
	script.async = true;
	script.defer = true;
	return script;
}

function initExpressPaymentConfirmation() {
	onceScriptLoaded("pd-express-payment-confirmation-script", () => {
		const apiKey = getConfig()?.apiKey;

		if (apiKey) {
			window.postMessage(
				{
					type: "PD_INIT_EXPRESS_PAYMENT_CONFIRMATION",
					hostURL: PD_HOST_URL,
					apiKey,
				},
				window.location.origin,
			);

			window.addEventListener("message", (event) => {
				if (event.origin !== new URL(PD_HOST_URL).origin) {
					return;
				}

				if (event.data?.type === "GO_TO_HOME_PAGE") {
					window.location.href = "/";
				}
			});
		}
	});
}
