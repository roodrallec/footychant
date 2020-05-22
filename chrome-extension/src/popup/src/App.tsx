import React, {useEffect, useState} from 'react'
import './App.css'
import {DropdownCombobox} from "./DropdownCombobox"
import {PlayArrow, Pause, GitHub, VolumeUp} from '@material-ui/icons'
import Slider from '@material-ui/core/Slider';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import grey from "@material-ui/core/colors/grey"
import {Box, Button, Link, Typography} from "@material-ui/core"

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#1b5e20',
    },
    secondary: grey
  }
});

const teamsUrl = chrome.runtime.getURL('assets/teams.json')

interface Chant {
  url: string
  icon: string
  name: string
}

interface Team {
  name: string
  country: {
    name: string,
    icon: string
  },
  fanChantsUrl: string,
  chants: Chant[],
  icon: string
}

interface TabState {
  audioState: AudioState,
  volume: number
  currentTeam?: string
}

type AudioState = 'not_started' | 'playing' | 'paused';

function getState(callback: (state: TabState) => void) {
  chrome.runtime.sendMessage({action: 'getState'}, callback)
}

async function loadTeams(): Promise<Team[]> {
  try {
    const response = await fetch(teamsUrl)
    return await response.json()
  } catch (err) {
    console.error(err)
    return []
  }
}

async function sendToActiveTab(message: any): Promise<any> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, resolve)
  })
}

const App: React.FC = () => {
  let [teams, setTeams] = useState<Team[]>([])
  const [soundState, setSoundState] = useState('loading')
  const [team, setTeam] = useState<Team>()

  const [volume, setVolume] = React.useState(100);

  const [volumeDisplayed, setVolumeDisplayed] = React.useState(false)

  const toggleVolumeDisplay = () => {
    setVolumeDisplayed(!volumeDisplayed)
  }

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    sendToActiveTab({action: 'setVolume', volume: newValue}).then((response)=> {
      if(response === 'ok') {
        setVolume(newValue);
      }
    })
  };

  useEffect(() => {
    loadTeams().then(teams => {
      setTeams(teams.map(team=>({...team, country: {...team.country, icon: chrome.extension.getURL("assets/"+team.country.icon)}})).sort((a, b) => a.name.localeCompare(b.name)))
    })
  }, [])

  useEffect(() => {
    if (teams.length > 0) {
      getState((state) => {
        if (!state) return
        setSoundState(state.audioState)
        setVolume(state.volume*100)
        if (teams) {
          if (state.currentTeam) {
            const team = teams.find(team => team.name === state.currentTeam)
            if (team) {
              setTeam(team)
            }
          } else {
            setTeam(undefined)
          }
        }
      })
    }
  }, [teams])


  const startChants = async (team: Team) => {
    const response = await sendToActiveTab({
      action: 'start',
      chants: team.chants.map(chant => chant.url),
      loop: true,
      team: team.name
    })
    if (response) {
      setSoundState('playing')
      return true
    } else {
      return false
    }
  }

  const pauseAudio = () => {
    sendToActiveTab({action: 'stop'})
      .then(response => {
        if (response) {
          setSoundState('paused')
        }
      })
  }

  const continueAudio = () => {
    sendToActiveTab({action: 'start'})
      .then(response => {
        if (response) {
          setSoundState('playing')
        }
      })
  }

  const handleButtonClick = () => {
    switch (soundState) {
      case 'not_started': {
        if (team) {
          startChants(team)
        }
        break
      }
      case 'paused': {
        continueAudio()
        break
      }
      case 'playing': {
        pauseAudio()
        break
      }
    }
  }

  const startTeamChants = (team: Team) => {
    if (team) {
      startChants(team).then(started => started && setTeam((team)))
    } else {
      pauseAudio()
    }
  }

  if (soundState === "loading") {
    return <div className="App">Loading...</div>
  }



  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <div id="main-container">
          {(teams.length > 0 && !team) &&
          <DropdownCombobox items={teams} onChange={(team: Team) => startTeamChants(team)}/>
          }
          {team &&
          <>
            <Box>
              <Typography variant='h5'>You are listening to</Typography>
              <Typography variant='h4'>{team.name}</Typography>
              <Link href={"#"} onClick={() => setTeam(undefined)}>Change team</Link>
            </Box>
            <Box className='play-button-container'>
              <Button variant='contained' color='primary' onClick={handleButtonClick}>
                {soundState === 'not_started' || soundState === 'paused'
                  ? <PlayArrow/>
                  : <Pause/>}
              </Button>
            </Box>
            <Box>
              <Link target='_blank' rel='noopener' href={team.fanChantsUrl} >See all {team.name} chants on fanchants.com</Link>
            </Box>
          </>
          }
        </div>
        <footer>
          <Box>
            <div className='slider-container'>
              <Button onClick={toggleVolumeDisplay}>
                <VolumeUp className='slider-volume-icon'/>
              </Button>
              {volumeDisplayed &&
              <Slider color='secondary' value={volume} onChange={(ev, value) => handleChange(ev, value as number)}
                      aria-labelledby="continuous-slider"/>
              }
            </div>
            <Box style={{textAlign: "left"}}>
              <span>Chants by</span>
              <br/>
              <a rel="noopener noreferrer" href='https://fanchants.com' target="_blank">
                <img alt={"FanChants.com logo"} height='30' src="/assets/fanchants-logo.svg" />
              </a>
            </Box>

          </Box>
          <a rel="noopener noreferrer" className='github-link' target="_blank" href={"https://github.com/roodrallec/footychant"}>
            <GitHub/>
          </a>
        </footer>
      </div>
    </ThemeProvider>
  )
}

export default App
