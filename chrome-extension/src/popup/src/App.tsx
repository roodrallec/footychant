import React, { useEffect, useState } from 'react';
import './App.css';

const chantsUrl = "https://drive.google.com/u/0/uc?id=1egQNfvMbg2EiUTM-zhIzgMlp6N839eN0&export=download";
const defaultChant = {
  name: 'General',
  icon: 'https://lh3.googleusercontent.com/proxy/nxDF_ARO0K--S_fIwxqpjYSQAgflfn0u067d9vkTru914w7-5yXHCyu4XbBsbmdWlPPlbYRqUFVGq-nzHNesZCKwI1TnWQ_Kj7jENdN73WzuGZDeEeDeJOnGIuRM6CCDRGapLUBXh7zHJn8JyjCJsQ',
  url: chrome.runtime.getURL('./assets/chant.wav')
};

type Chant = {
  url: string
  icon: string
  name: string
}

type AudioState = 'not_started' | 'playing' | 'paused';

const App: React.FC = () => {
  let chants: Chant[] = [defaultChant];

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

  const loadChants = async (): Promise<Chant[]> => {
    try {
      const response = await fetch(chantsUrl);
      const jsonChants = await response.json();
      return chants.concat(jsonChants);
    }
    catch (err) {
      console.error(err);
      return [];
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
    backgroundImage: 'url(' + url + ')',
  });

  return (
    <div className="App">
      <table>
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
      </table>
    </div>
  );
};

export default App;
