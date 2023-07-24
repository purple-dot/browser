export function injectComponentScripts() {
  injectScriptOnce(makeLearnMoreScript());
  injectScriptOnce(makeCheckoutScript());
}

function injectScriptOnce(el: HTMLScriptElement) {
  if (!document.getElementById(el.id)) {
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

function makeScriptTag({ id, src }: { id: string; src: string }) {
  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  script.defer = true;
  return script;
}
