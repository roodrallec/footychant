/*
  Content script which injects the required js for webcam feed filters
*/

function scriptFromFile(name) {
  var script = document.createElement('script');
  script.src = chrome.extension.getURL(name);
  script.async = false;
  return script;
}

function inject(scripts) {
  if (scripts.length === 0)
      return;
  var script = scripts[0];
  var otherScripts = scripts.slice(1);
  var el = (document.head || document.documentElement)
  el.appendChild(script);
  inject(otherScripts);
}

inject([
  scriptFromFile("") // Path to injected js script
]);