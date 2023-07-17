export function injectComponentScripts() {
  injectScriptOnce(makeLearnMoreScript());
}

function injectScriptOnce(el: HTMLScriptElement) {
  if (!document.getElementById(el.id)) {
    document.head.append(el);
  }
}

function makeLearnMoreScript() {
  const learnMoreScript = document.createElement("script");
  learnMoreScript.id = "pd-learn-more-script";
  learnMoreScript.src = "https://www.purpledotprice.com/api/v1/learn-more.js";
  learnMoreScript.async = true;
  learnMoreScript.defer = true;
  return learnMoreScript;
}
