let audioContainer;

let chants = [];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  switch (request.action) {
    case 'start': {
      if (request.chants) {
        chants = request.chants;
        audioContainer = new Audio(chants.pop());
        document.body.appendChild(audioContainer);
        audioContainer.play();
        audioContainer.onended = () => {
          if (chants.length > 0) {
            audioContainer.src = chants.pop();
            audioContainer.play();
          }
        };
        sendResponse('ok');
      } else if (audioContainer) {
        audioContainer.play();
        sendResponse('ok');
      }
      break;
    }
    case 'stop': {
      audioContainer.pause();
      sendResponse('ok');
      break;
    }
    case 'getAudioState': {
      if (audioContainer) {
        if (audioContainer.paused) {
          sendResponse('paused');
        } else {
          sendResponse('playing');
        }
      } else {
        sendResponse('not_started');
      }
    }
  }
});
