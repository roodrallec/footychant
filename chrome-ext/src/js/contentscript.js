/*
  Content script which injects the required js for webcam feed filters
*/
var docEl = (document.head||document.documentElement);
var getUserMediaOverload = document.createElement('script');
var audio = chrome.runtime.getURL("src/assets/chant.mp3");

getUserMediaOverload.textContent = "\
console.log('playing sounds');\
var a = new Audio(\
    '" + audio + "'\
);\
a.play();\
";
docEl.appendChild(getUserMediaOverload);
