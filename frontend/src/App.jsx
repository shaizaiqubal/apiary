import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react'

import Beedex from './pages/Beedex'
import Home from './pages/Home'
import MapView from './pages/MapView'
import NewPlot from './pages/NewPlot'
import PlotCarousel from './pages/PlotCarousel'
import PlotDetail from './pages/PlotDetail'
import HowTo from './pages/HowTo'
import { playClickSound } from './audio'

import './App.css'

function App() {
  useEffect(() => {
    const handleClick = (event) => {
      if (event.target.closest('button, a, select, input[type="submit"], input[type="button"], [role="button"]')) {
        playClickSound()
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return(
  <BrowserRouter>
    <Routes>
      <Route path ="/" element= {<Home/>} />
      <Route path ="/beedex" element= {<Beedex/>} />
      <Route path ="/map" element= {<MapView/>} />
      <Route path ="/plots" element= {<PlotCarousel/>} />
      <Route path ="/plot/new" element= {<NewPlot/>} />
      <Route path ="/plot/:plotId" element= {<PlotDetail/>} />
      <Route path ="/howto" element= {<HowTo/>} />
    </Routes>
  </BrowserRouter>
  
  );
}

export default App
