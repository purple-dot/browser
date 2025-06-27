export function onDOMContentLoaded(cb: () => void) {
	if (document.readyState === "loading") {
		// Loading hasn't finished yet
		document.addEventListener("DOMContentLoaded", cb);
	} else {
		// `DOMContentLoaded` has already fired
		cb();
	}
}

export function onLocationChange(cb: () => void) {
	let oldUrl = window.location.href;
	new MutationObserver(() => {
		const newUrl = window.location.href;
		if (oldUrl !== newUrl) {
			cb();
			oldUrl = newUrl;
		}
	}).observe(document.body, { attributes: true });
}

export function onPurpleDotEvent(name: string, cb: (data: object) => void) {
	window.addEventListener(`PurpleDot:${name}`, (event) => {
		if (!(event instanceof CustomEvent)) {
			return;
		}

		cb(event.detail);
	});
}
