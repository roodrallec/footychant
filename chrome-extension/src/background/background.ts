const mxIntervalSecs = 15; // Seconds interval to try and add the next mix chant
const mxFadeSecs = 5; // Seconds to fade in/out mix chant to max/min volume
const bgVolume = 1; // Volume to have the background chant at

let mxChant; // Var to store currently playing mix chant
let mxChantTimeout;
let mxChants = []; // Array of all mix chants
let mxContainer; // Mix chant audio container
let mxContainerVol = 1; // Volume for mix chant audio
let bgContainer; // Background chant audio container
let bgChant = chrome.runtime.getURL('assets/chant.wav'); // Background chant audio
let currentTeam; // Current team selected
let paused;

function startBgContainer() {
  if (!bgContainer) {
    bgContainer = new Audio(bgChant); // Background chant audio container
    bgContainer.volume = bgVolume;
    document.body.appendChild(bgContainer);
    bgContainer.addEventListener('timeupdate', function () {
      if (this.currentTime > this.duration - 0.5) {
        //Prevents gap in audio loop
        this.currentTime = 0;
        this.play();
      }
    });
  }
  chrome.browserAction.setBadgeText({ text: 'On' });
  chrome.browserAction.setBadgeBackgroundColor({ color: '#00934e' });
  bgContainer.play();
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

function buildMxContainer() {
  mxChant = mxChants[getRandomInt(mxChants.length)];
  mxContainer = new Audio(mxChant.url);
  mxContainer.volume = 0;
  mxContainer.addEventListener('timeupdate', function () {
    if (this.currentTime <= mxFadeSecs) {
      // Fade in
      this.volume = mxContainerVol * (this.currentTime / mxFadeSecs);
    } else if (
      this.currentTime < this.duration &&
      this.currentTime > this.duration - mxFadeSecs
    ) {
      // Fade out
      this.volume =
        mxContainerVol * ((this.duration - this.currentTime) / mxFadeSecs);
    } else {
      this.volume = mxContainerVol;
    }
  });
  mxContainer.onended = setChantTimeout;
}

function setChantTimeout() {
  if (mxChantTimeout) clearTimeout(mxChantTimeout);
  mxChantTimeout = setTimeout(() => {
    nextChant();
  }, mxIntervalSecs * 1000);
}

function nextChant() {
  if (paused || mxChants.length == 0 || !mxContainer) return;
  mxChant = mxChants[getRandomInt(mxChants.length)];
  mxContainer.src = mxChant.url;
  mxContainer.onended = setChantTimeout;
  mxContainer.play();
}

function updateChants(chantUrls: string[] = [], team: string) {
  if (chantUrls.length == 0) return;

  mxChants = chantUrls;
  if (!mxContainer) buildMxContainer();

  if (currentTeam && currentTeam != team) {
    mxContainer.pause();
    mxChant = mxChants[getRandomInt(mxChants.length)];
    mxContainer.src = mxChant.url;
  }
  currentTeam = team;
  mxContainer.play();
  document.body.appendChild(mxContainer);
}

function setVolume(volume: any) {
  mxContainerVol = volume / 100;
  bgContainer.volume = volume / 100;
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.action) {
    case 'start': {
      paused = false;
      startBgContainer();
      if (request.chants) {
        updateChants(request.chants, request.team);
      } else if (mxChants.length > 0) {
        mxContainer.play();
      }
      sendResponse({
        status: 'ok',
        chant: mxChant
      });
      break;
    }
    case 'stop': {
      paused = true;
      chrome.browserAction.setBadgeText({ text: '' });
      mxContainer.pause();
      bgContainer.pause();
      sendResponse('ok');
      break;
    }
    case 'setVolume': {
      setVolume(request.volume);
      sendResponse('ok');
      break;
    }
    case 'skipChant': {
      nextChant();
      sendResponse({
        status: 'ok',
        chant: mxChant
      });
      break;
    }
    case 'getState': {
      if (bgContainer && mxChants.length > 0) {
        if (bgContainer.paused) {
          sendResponse({
            audioState: 'paused',
            volume: mxContainerVol,
            currentTeam: currentTeam,
            currentChant: mxChant
          });
        } else {
          sendResponse({
            audioState: 'playing',
            volume: mxContainerVol,
            currentTeam: currentTeam,
            currentChant: mxChant
          });
        }
      } else {
        sendResponse({
          audioState: 'not_started',
          volume: mxContainerVol,
          currentTeam: undefined,
          currentChant: undefined
        });
      }
    }
  }
});
