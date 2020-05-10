import React, { useEffect, useState } from 'react';
import './App.css';

const chantsUrl = chrome.runtime.getURL('assets/chants.json')
const defaultChant = {
  name: 'General',
  icon: chrome.runtime.getURL('assets/football.png'),
  url: chrome.runtime.getURL('assets/chant.wav')
};

type Chant = {
  url: string
  icon: string
  name: string
}

type AudioState = 'not_started' | 'playing' | 'paused';

let chants: Chant[] = [defaultChant];

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
  const chantIcon = (url: string) => ({
    background: 'url(' + url + ')',
  });

  return (
    <div className="App">
      <table>
        <tbody>
        {chants.map(({ name, icon, url }) => (
          <tr>
            <td><span style={chantIcon(icon)}></span></td>
            <td><p>{name}</p></td>
            <td><button onClick={playChant([url])}>
              {soundState === 'not_started' || soundState === 'paused'
                ? 'Play'
                : 'Stop'}
            </button></td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
