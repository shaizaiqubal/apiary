import { useState } from "react"
import { newPlot } from "../api"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer } from "react-leaflet"
import LocationPicker from "../components/LocationPicker"

const NewPlot = () =>{
    const [plot, setPlot] = useState({plot_name:'', latitude:'', longitude: '', sun_shade:'', plot_type: '', area_sq_m:''})
    const [coords, setCoords] = useState(null)
    const [locationError, setLocationError] = useState('')
    const navigate = useNavigate()

    const numericFields = ["latitude", "longitude", "area_sq_m", "plot_type"]

    const handleChange = (e) => {
    const { name, value } = e.target
    setPlot({
        ...plot,
        [name]: numericFields.includes(name) ? parseFloat(value) : value
    })
    }

    const handleSubmit = async (e) => {
    e.preventDefault()
    if (!coords || coords.length < 2) {
        setLocationError('Choose a location on the map or use your current location before creating the plot.')
        return
    }
    setLocationError('')
    const latitude = parseFloat(coords[0])
    const longitude = parseFloat(coords[1])
    const updatedPlot = {... plot, ["latitude"]:latitude, ["longitude"]:longitude}
    setPlot(updatedPlot)
    const data = await newPlot(updatedPlot)
    console.log(data)
    navigate(`/plots`)
    }
    const getCurrentLocation = () =>{
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setCoords([latitude,longitude])
            }
        )
    }

    return(
        <>
        <MapContainer 
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: '300px', width: '90%' }}>
                <TileLayer 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                <LocationPicker coords={coords} setCoords={setCoords}/>
        </MapContainer>
        <button onClick={getCurrentLocation}>Get my current location</button>

        <form onSubmit={handleSubmit}>
            {locationError && <p role="alert">{locationError}</p>}
            <input
                type="text"
                name="plot_name"
                value={plot.plot_name}
                onChange={handleChange}
                placeholder="Plot name"
                required
            />

            <input 
                type="number"
                name="area_sq_m"
                value={plot.area_sq_m}
                onChange={handleChange}
                placeholder="Area per square metre"
            />

            <select name="sun_shade" value={plot.sun_shade} onChange={handleChange}>
                <option value="">Select sun/shade</option>
                <option value="full_sun">Full sun</option>
                <option value="partial_shade">Partial shade</option>
                <option value="full_shade">Full shade</option>
            </select>

            <select name="plot_type" value={plot.plot_type} onChange={handleChange}>
                <option value="">Select plot type</option>
                <option value="1">Balcony Pot</option>
                <option value="2">Small Garden</option>
                <option value="3">Large Garden</option>
                <option value="4">Allotment</option>
            </select>

            <button type="submit">Create Plot!</button>

        </form>
        </>
    )
}

export default NewPlot