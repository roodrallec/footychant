import React, { useEffect, useState } from 'react';
import './App.css';

const chantsUrl = chrome.runtime.getURL('assets/chants.json')

type Chant = {
  url: string
  icon: string
  name: string
}

type AudioState = 'not_started' | 'playing' | 'paused';

let chants: Chant[] = [];

const App: React.FC = () => {
  const [soundState, setSoundState] = useState('unknown');

  useEffect(() => {
    loadChants();
    getAudioState((state) => {
      console.log(state);
      setSoundState(state);
    });
  }, []);

  const getAudioState = (callback: (state: AudioState) => void) => {
    console.log('Querying audio state');
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id as number,
        { action: 'getAudioState' },
        callback
      );
    });
  };

  const loadChants = async (): Promise<void> => {
    console.log('loading chants');
    try {
      const response = await fetch(chantsUrl);
      const jsonChants = await response.json();
      console.log('chants loaded');
      chants = chants.concat(jsonChants);
    }
    catch (err) {
      console.error(err);
    }
  }

  const playChant = (chantUrls: string[]) => () => {
    switch (soundState) {
      case 'not_started': {
        chrome.tabs.query({ active: true, currentWindow: true }, function (
          tabs
        ) {
          chrome.tabs.sendMessage(
            tabs[0].id as number,
            { action: 'start', chants: chantUrls, loop: true },
            (response) => {
              if (response === 'ok') {
                setSoundState('playing');
              }
            }
          );
        });
        break;
      }
      case 'paused': {
        chrome.tabs.query({ active: true, currentWindow: true }, function (
          tabs
        ) {
          chrome.tabs.sendMessage(
            tabs[0].id as number,
            { action: 'start', chants: chantUrls, loop: true },
            (response) => {
              if (response === 'ok') {
                setSoundState('playing');
              }
            }
          );
        });
        break;
      }
      case 'playing': {
        chrome.tabs.query({ active: true, currentWindow: true }, function (
          tabs
        ) {
          chrome.tabs.sendMessage(
            tabs[0].id as number,
            { action: 'stop' },
            (response) => {
              if (response === 'ok') {
                setSoundState('paused');
              }
            }
          );
        });
        break;
      }
    }
  };

  return (
    <div className="App">
      <button onClick={playChant(chants.map(c => c.url))}>
          {soundState === 'not_started' || soundState === 'paused'
            ? 'Play'
            : 'Stop'}
      </button>
    </div>
  );
};

export default App;
