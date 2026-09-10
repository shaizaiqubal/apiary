import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useState, useEffect } from 'react'
import { getPlots , getMap} from '../api'
import { Link } from 'react-router-dom'
import beePin from '../assets/beepin.png'
import './MapView.css'

const beePinIcon = new Icon({
    iconUrl: beePin,
    iconSize: [56, 56],
    iconAnchor: [28, 28],
    popupAnchor: [0, -28],
    className: 'mapview-bee-pin',
})

const MapZoomControls = () => {
    const map = useMap()

    return (
        <div className="mapview-zoom-controls" aria-label="Map zoom controls">
            <button type="button" onClick={() => map.zoomIn()} aria-label="Zoom in">+</button>
            <button type="button" onClick={() => map.zoomOut()} aria-label="Zoom out">-</button>
        </div>
    )
}

const MapCenter = ({ center }) => {
    const map = useMap()

    useEffect(() => {
        map.setView(center)
    }, [center, map])

    return null
}


const MapView = () => {
    const [plots,setPlots] = useState([])
    const [mapPlots,setMapPlots] = useState([])
    const plotMap = {1:'Balcony pot',2:'Small garden',3:'Large garden',4:'Allotment'}

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
                <MapCenter center={center} />

                {mapPlots.map((plot) => (
                    <Marker key={plot.id} position={[plot.latitude, plot.longitude]} icon={beePinIcon}>
                        <Tooltip direction="top" offset={[0, -28]} opacity={0.95}>
                            <div className="mapview-tooltip">
                                <strong className="mapview-tooltip__name">{plot.plot_name || 'Apiary plot'}</strong>
                                <span className="mapview-tooltip__type">{plotMap[plot.plot_type] || 'Garden'}</span>
                                <span className={`mapview-tooltip__level mapview-tooltip__level--${String(plot.milestone || 'Seedling').toLowerCase()}`}>
                                    {plot.milestone || 'Seedling'}
                                </span>
                            </div>
                        </Tooltip>
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

            <p className="mapview-hint mapview-overlay">Hover over a pin to view that plot</p>
        </main>
    )
}
export default MapView
