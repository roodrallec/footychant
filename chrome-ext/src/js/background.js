'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({ team: 'RM' }, function() {
    console.log("The color is green.");
    new chrome.declarativeContent.ShowPageAction()
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: '*'},
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
