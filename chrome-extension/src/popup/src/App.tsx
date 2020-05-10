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

interface TabState {
  audioState: AudioState,
  currentTeam?: string
}
type AudioState = 'not_started' | 'playing' | 'paused';

function getState(callback: (state: TabState) => void) {
  console.log('Querying state');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id as number,
      { action: 'getState' },
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
  const [soundState, setSoundState] = useState('loading');
  const [team, setTeam] = useState<Team>()

  useEffect(() => {
    loadTeams().then(teams=> {
      setTeams(teams.sort((a,b)=>a.name.localeCompare(b.name)))
    })
  }, []);

  useEffect(()=> {
    if(teams) {
      getState((state) => {
        console.log(state)
        setSoundState(state.audioState);
        if(teams) {
          if(state.currentTeam) {
            const team = teams.find(team=>team.name===state.currentTeam)
            if(team) {
              setTeam(team)
            }
          } else {
            setTeam(undefined)
          }
        }
      });
    }
  }, [teams])


  const startChants = async (team: Team) => {
    console.log(team)
    const response = await sendToActiveTab({ action: 'start', chants: team.chants.map(chant=>chant.url), loop: true, team: team.name})
    if(response) {
      setSoundState('playing')
      return true
    } else {
      return false
    }
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
          startChants(team)
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

  if(soundState === "loading") {
    return <div className="App">Loading...</div>
  }

  const startTeamChants = (team: Team) => {
    if(team) {
      startChants(team).then(started =>started && setTeam((team)))
    } else {
      pauseAudio()
    }
  }

  return (
    <div className="App">
      {(teams.length>0 && !team) &&
        <DropdownCombobox items={teams} onChange={(team:Team)=>startTeamChants(team)} />
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
