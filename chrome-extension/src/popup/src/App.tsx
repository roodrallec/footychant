import React, { useEffect, useState } from 'react';
import './App.css';
import {DropdownCombobox} from "./DropdownCombobox"

const teamsUrl = chrome.runtime.getURL('assets/teams.json')
const defaultChant = {
  name: 'General',
  icon: chrome.runtime.getURL('assets/football.png'),
  url: chrome.runtime.getURL('assets/chant.wav')
};

interface Chant {
  url: string
  icon: string
  name: string
}

interface Team {
  name: string
  country?: string
  chants: Chant[]
}

type AudioState = 'not_started' | 'playing' | 'paused';

function getAudioState(callback: (state: AudioState) => void) {
  console.log('Querying audio state');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id as number,
      { action: 'getAudioState' },
      callback
    );
  });
}

async function loadTeams(): Promise<Team[]> {
  try {
    const response = await fetch(teamsUrl);
    return await response.json();
  }
  catch (err) {
    console.error(err);
    return []
  }
}

async function sendToActiveTab(message: any):Promise<any> {
  return new Promise((resolve,reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (
      tabs
    ) {
      chrome.tabs.sendMessage(
        tabs[0].id as number,
        message,
        (response) => {
          resolve(response);
        }
      );
    });
  })
}

const App: React.FC = () => {
  let [teams, setTeams] = useState<Team[]>([])
  const [soundState, setSoundState] = useState('unknown');
  const [team, setTeam] = useState<Team>()

  useEffect(() => {
    loadTeams().then(teams=> {
      setTeams(teams)
    })
    getAudioState((state) => {
      setSoundState(state);
    });
  }, []);


  const startChants = (chants: Chant[]) => {
    sendToActiveTab({ action: 'start', chants: chants.map(chant=>chant.url), loop: true })
      .then(response => {
        if(response) {
          setSoundState('playing')
        }
      })
  }

  const pauseAudio = () => {
    sendToActiveTab({ action: 'stop' })
      .then(response => {
        if(response) {
          setSoundState('paused')
        }
      })
  }

  const continueAudio = () => {
    sendToActiveTab({ action: 'start' })
      .then(response => {
        if(response) {
          setSoundState('playing')
        }
      })
  }

  const handleButtonClick = () => {
    switch (soundState) {
      case 'not_started': {
        if(team) {
          startChants(team.chants)
        }
        break;
      }
      case 'paused': {
        continueAudio();
        break;
      }
      case 'playing': {
        pauseAudio()
        break;
      }
    }
  };

  return (
    <div className="App">
      {(teams && !team) &&
        <DropdownCombobox items={teams} onChange={(team:Team)=>setTeam(team)} />
      }
      {team && <div>
        <p>
          <strong>Selected team: </strong>
          <span>{team.name}</span>
        </p>
        <button onClick={()=>setTeam(undefined)}>Change team</button>
      </div>
      }
      <button onClick={handleButtonClick}>
        {soundState === 'not_started' || soundState === 'paused'
          ? 'Play'
          : 'Stop'}
      </button>
    </div>
  );
};

export default App;
