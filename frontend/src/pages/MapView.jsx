import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useState, useEffect } from 'react'
import { getPlots , getMap} from '../api'
import { Link } from 'react-router-dom'
import './MapView.css'

const MapZoomControls = () => {
    const map = useMap()

    return (
        <div className="mapview-zoom-controls" aria-label="Map zoom controls">
            <button type="button" onClick={() => map.zoomIn()} aria-label="Zoom in">+</button>
            <button type="button" onClick={() => map.zoomOut()} aria-label="Zoom out">-</button>
        </div>
    )
}


const MapView = () => {
    const [plots,setPlots] = useState([])
    const [mapPlots,setMapPlots] = useState([])

    useEffect(() => {
        const fetchPlots = async() => {
            const data = await getPlots()
            setPlots(data)
        }
        fetchPlots()
    }, [])

    const center = plots.length > 0
                ? [plots[0].latitude, plots[0].longitude]
                : [51.505, -0.09] 
    useEffect(() => {
        const fetchMap = async() => {
            const data = await getMap()
            setMapPlots(data)
        }
        fetchMap()
    }, [])

    return(
       <main className="mapview-page">
       <MapContainer 
            center={center}
            zoom={13}
          zoomControl={false}
            className="mapview-map">

                <TileLayer 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

                <MapZoomControls />

                {mapPlots.map((plot) => (
                    <Marker key={plot.id} position={[plot.latitude, plot.longitude]}>
                        <Popup>
                            <strong>{plot.plot_name || 'Apiary plot'}</strong>
                            <br />
                            <Link to={`/plot/${plot.id}`}>OPEN PLOT</Link>
                        </Popup>
                    </Marker>
                ))}
        </MapContainer>

            <header className="mapview-header mapview-overlay">
                <h1>Field Map</h1>
                <p>{plots.length} Plots</p>
            </header>

            <Link to="/plot/new" className="mapview-add mapview-overlay">
                <span aria-hidden="true">+</span>
                <span>Add plot</span>
            </Link>

            <p className="mapview-hint mapview-overlay">Tap a pin to view that plot</p>
        </main>
    )
}
export default MapView