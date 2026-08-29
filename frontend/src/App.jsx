import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Beedex from './pages/Beedex'
import Home from './pages/Home'
import MapView from './pages/MapView'
import NewPlot from './pages/NewPlot'
import PlotCarousel from './pages/PlotCarousel'
import PlotDetail from './pages/PlotDetail'

import './App.css'

function App() {
  return(
  <BrowserRouter>
    <Routes>
      <Route path ="/" element= {<Home/>} />
      <Route path ="/beedex" element= {<Beedex/>} />
      <Route path ="/map" element= {<MapView/>} />
      <Route path ="/plots" element= {<PlotCarousel/>} />
      <Route path ="/plot/new" element= {<NewPlot/>} />
      <Route path ="/plot/:plotId" element= {<PlotDetail/>} />
    </Routes>
  </BrowserRouter>
  
  );
}

export default App
