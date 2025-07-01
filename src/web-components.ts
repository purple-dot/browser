export function injectComponentScripts() {
	injectScriptOnce(makeLearnMoreScript());
	injectScriptOnce(makeCheckoutScript());
	injectScriptOnce(makeSelfServiceScript());
	injectScriptOnce(makeSeparateBagScript());
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

function makeLearnMoreScript() {
	return makeScriptTag({
		id: "pd-learn-more-script",
		src: "https://www.purpledotprice.com/api/v1/learn-more.js",
	});
}

function makeCheckoutScript() {
	return makeScriptTag({
		id: "pd-checkout-script",
		src: "https://www.purpledotprice.com/api/v1/checkout.js",
	});
}

function makeSelfServiceScript() {
	return makeScriptTag({
		id: "pd-self-service-script",
		src: "https://www.purpledotprice.com/api/v1/self-service.js",
	});
}

function makeSeparateBagScript() {
	return makeScriptTag({
		id: "pd-separate-bag-script",
		src: "https://www.purpledotprice.com/api/v1/separate-bag.js",
	});
}

function makeScriptTag({ id, src }: { id: string; src: string }) {
	const script = document.createElement("script");
	script.id = id;
	script.src = src;
	script.async = true;
	script.defer = true;
	return script;
}
