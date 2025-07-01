export function injectComponentScripts() {
	const webComponents = [
		"learn-more",
		"checkout",
		"self-service",
		"separate-bag",
	];

	webComponents.forEach((component) => {
		injectScriptOnce(
			makeScriptTag({
				id: `pd-${component}-script`,
				src: `https://www.purpledotprice.com/api/v1/${component}.js`,
			}),
		);
	});
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
