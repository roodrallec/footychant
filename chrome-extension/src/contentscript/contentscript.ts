let audioContainer;
let currentChant;
let loop;
let chants = [];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  switch (request.action) {
    case 'start': {
      if (request.chants) {
        chants = request.chants;
        loop = request.loop;
        currentChant = chants.shift();
        audioContainer = new Audio(currentChant);
        document.body.appendChild(audioContainer);
        audioContainer.play();
        audioContainer.onended = () => {
          if (loop && currentChant) chants.push(currentChant);
          if (chants.length > 0) {
            currentChant = chants.shift();
            audioContainer.src = currentChant;
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
