import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react'

import Beedex from './pages/Beedex'
import Home from './pages/Home'
import MapView from './pages/MapView'
import NewPlot from './pages/NewPlot'
import PlotCarousel from './pages/PlotCarousel'
import PlotDetail from './pages/PlotDetail'
import { validateUser } from './api'
import { playClickSound } from './audio'

import './App.css'


function UserGuard({ children }) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    const uuid = localStorage.getItem('apiary_uuid')

    if (!uuid) {
      setStatus('invalid')
      return
    }

    validateUser()
      .then(() => {
        setStatus('valid')
      })
      .catch((error) => {
        if (error.response?.status === 404) {
          // UUID exists locally but the user no longer exists in DB
          localStorage.removeItem('apiary_uuid')
          setStatus('invalid')
        } else {
          // Network/server error — don't destroy a potentially valid UUID
          console.error(error)
          setStatus('valid')
        }
      })
  }, [])

  if (status === 'checking') {
    return null
  }

  if (status === 'invalid') {
    return <Navigate to="/" replace />
  }

  return children
}


function App() {
  useEffect(() => {
    const handleClick = (event) => {
      if (
        event.target.closest(
          'button, a, select, input[type="submit"], input[type="button"], [role="button"]'
        )
      ) {
        playClickSound()
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/beedex"
          element={
            <UserGuard>
              <Beedex />
            </UserGuard>
          }
        />

        <Route
          path="/map"
          element={
            <UserGuard>
              <MapView />
            </UserGuard>
          }
        />

        <Route
          path="/plots"
          element={
            <UserGuard>
              <PlotCarousel />
            </UserGuard>
          }
        />

        <Route
          path="/plot/new"
          element={
            <UserGuard>
              <NewPlot />
            </UserGuard>
          }
        />

        <Route
          path="/plot/:plotId"
          element={
            <UserGuard>
              <PlotDetail />
            </UserGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App