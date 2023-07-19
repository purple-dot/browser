export function onDOMContentLoaded(cb: () => {}) {
  if (document.readyState === "loading") {
    // Loading hasn't finished yet
    document.addEventListener("DOMContentLoaded", cb);
  } else {
    // `DOMContentLoaded` has already fired
    cb();
  }
}

export function onLocationChange(cb: () => {}) {
  let oldUrl = window.location.href;
  new MutationObserver(() => {
    const newUrl = window.location.href;
    if (oldUrl !== newUrl) {
      cb();
      oldUrl = newUrl;
    }
  }).observe(document.body);
}
