let changeColor = document.getElementById("changeColor");
function connect() {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const port = chrome.tabs.connect(tabs[0].id);
		port.postMessage({ function: 'html' });
		port.onMessage.addListener((response) => {
			html = response.html;
			title = response.title;
			description = response.description;
		});
	});
}
window.addEventListener('load', (event) => {
	chrome.tabs.executeScript(null, {
	  file: 'src/js/contentscript.js',
	}, () => {
		connect() //this is where I call my function to establish a connection     });
	});
  });
