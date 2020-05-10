/*
  Content script which injects the required js for webcam feed filters
*/
var docEl = (document.head||document.documentElement);
var getUserMediaOverload = document.createElement('script');
// var audio = chrome.runtime.getURL("src/assets/chant.mp3");

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    console.log('msg received', msg);
    // if (msg.function == 'html') {
    //   port.postMessage({
    //     html: document.documentElement.outerHTML,
    //     description: document.querySelector("meta[name=\'description\']").getAttribute('content'),
    //     title: document.title });
    // }
  });
});
// getUserMediaOverload.textContent = "\
// console.log('playing sounds');\
// var a = new Audio(\
//     '" + audio + "'\
// );\
// a.play();\
// ";
docEl.appendChild(getUserMediaOverload);
