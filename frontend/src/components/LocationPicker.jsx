import { useMapEvents, useMap, Marker } from "react-leaflet";
import { useEffect } from "react";

const LocationPicker = ({ coords, setCoords }) => {
    const map = useMap()
    useMapEvents(
        { click: (e) => setCoords([e.latlng.lat, e.latlng.lng]) }
    )
    useEffect(() => {
        if(coords){
            map.setView(coords)
        }
    },[coords,map])
    return coords ? <Marker position={coords} /> : null
}

export default LocationPicker