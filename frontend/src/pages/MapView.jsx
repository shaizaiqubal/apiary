import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { useState, useEffect } from 'react'
import { getPlots , getMap} from '../api'


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
       <MapContainer 
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: '900px', width: '100%' }}>

                <TileLayer 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>

                {mapPlots.map((plot) => (
                    <Marker key={plot.id} position={[plot.latitude, plot.longitude]} />
                ))}
        </MapContainer>
    )
}
export default MapView