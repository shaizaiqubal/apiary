import { useMapEvents, Marker } from "react-leaflet"
const LocationPicker = ({ coords, setCoords }) => {
    useMapEvents(
        { click: (e) => setCoords([e.latlng.lat, e.latlng.lng]) }
    )
    console.log(coords )
    //return null
    return coords ? <Marker position={coords} /> : null
}

export default LocationPicker