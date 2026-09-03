import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useState, useEffect } from 'react'
import { getPlots , getMap} from '../api'
import { Link } from 'react-router-dom'
import './MapView.css'


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
            <header className="mapview-header">
                <div>
                    <p className="mapview-kicker">FIELD ATLAS // EXPLORATION MAP</p>
                    <h1>Apiary map</h1>
                    <p className="mapview-intro">Your growing network of pollinator habitats.</p>
                </div>
                <div className="mapview-stat" aria-label={`${mapPlots.length} mapped plots`}>
                    <strong>{mapPlots.length}</strong>
                    <span>PINNED PLOTS</span>
                </div>
            </header>
            <div className="mapview-toolbar">
                <span><i className="mapview-dot" aria-hidden="true" /> {mapPlots.length ? 'Habitat pins are active' : 'No habitat pins yet'}</span>
                <div className="mapview-actions">
                    <Link to="/plots" className="mapview-action">VIEW PLOTS</Link>
                    <Link to="/plot/new" className="mapview-action mapview-action--primary">+ ADD PLOT</Link>
                </div>
            </div>
       <MapContainer 
            center={center}
            zoom={13}
            className="mapview-map">

                <TileLayer 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

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
        </main>
    )
}
export default MapView