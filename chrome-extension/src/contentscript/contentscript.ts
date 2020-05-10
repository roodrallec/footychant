const mxIntervalSecs = 10; // Seconds interval to try and add the next mix chant
const mxFadeSecs = 5; // Seconds to fade in/out mix chant to max/min volume
const bgVolume = 1; // Volume to have the background chant at

let mxChant; // Var to store currently playing mix chant
let mxChants = []; // Array of all mix chants
let mxContainer; // Mix chant audio container
let mxContainerVol; // Volume for mix chant audio
let bgChant = chrome.runtime.getURL('assets/chant.wav'); // Background chant audio
let bgContainer = new Audio(bgChant); // Background chant audio container
let currentTeam = undefined;

bgContainer.volume = bgVolume;
document.body.appendChild(bgContainer);
bgContainer.addEventListener('timeupdate', function () {
  if (this.currentTime > this.duration - 0.5) {
    //Prevents gap in audio loop
    this.currentTime = 0;
    this.play();
  }
});

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

function updateChants(chantUrls: string[] = [], team: string) {
  mxChants = chantUrls;
  currentTeam = team;
  if (mxContainer || mxChants.length == 0) return;

  mxChant = mxChants[getRandomInt(mxChants.length)];
  mxContainer = new Audio(mxChant);
  mxContainer.volume = 0;
  mxContainer.addEventListener('timeupdate', function () {
    if (this.currentTime <= mxFadeSecs) {
      // Fade in
      this.volume = this.currentTime / mxFadeSecs;
    } else if (
      this.currentTime < this.duration &&
      this.currentTime > this.duration - mxFadeSecs
    ) {
      // Fade out
      this.volume = (this.duration - this.currentTime) / mxFadeSecs;
    } else {
      this.volume = 1;
    }
  });
  mxContainer.onended = () => {
    if (mxChants.length == 0) return;

    mxChant = mxChants[getRandomInt(mxChants.length)];
    mxContainer.src = mxChant;
    setTimeout(() => {
      mxContainer.play();
    }, mxIntervalSecs * 1000);
  };
  mxContainer.play();
  document.body.appendChild(mxContainer);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
  switch (request.action) {
    case 'start': {
      if (bgContainer && bgContainer.paused) bgContainer.play();
      if (request.chants) {
        updateChants(request.chants, request.team);
        sendResponse('ok');
      } else if(mxChants.length>0) {
        mxContainer.play();
        sendResponse('ok');
      }
      break;
    }
    case 'stop': {
      bgContainer.pause();
      mxContainer.pause();
      sendResponse('ok');
      break;
    }
    case 'getState': {
      if (bgContainer && mxChants.length>0) {
        if (bgContainer.paused) {
          sendResponse({audioState: 'paused', currentTeam: currentTeam});
        } else {
          console.log({audioState:'playing', currentTeam: currentTeam})
          sendResponse({audioState:'playing', currentTeam: currentTeam});
        }
      } else {
        sendResponse({audioState: 'not_started', currentTeam: undefined});
      }
    }
  }
});
