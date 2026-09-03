import { useState } from "react"
import { newPlot } from "../api"
import { useNavigate } from "react-router-dom"
import { MapContainer, TileLayer } from "react-leaflet"
import LocationPicker from "../components/LocationPicker"
import "./NewPlot.css"

const NewPlot = () =>{
    const [plot, setPlot] = useState({plot_name:'', latitude:'', longitude: '', sun_shade:'', plot_type: '', area_sq_m:''})
    const [coords, setCoords] = useState(null)
    const [locationError, setLocationError] = useState('')
    const [isLocating, setIsLocating] = useState(false)
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
        if (!navigator.geolocation) {
            setLocationError('Your browser does not support location services. Choose a spot on the map.')
            return
        }
        setIsLocating(true)
        setLocationError('')
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setCoords([latitude,longitude])
                setIsLocating(false)
            },
            () => {
                setIsLocating(false)
                setLocationError('We could not find you. Check location permissions or choose a spot on the map.')
            }
        )
    }

    return(
        <main className="newplot-page">
            <header className="newplot-header">
                <div>
                    <h1>Create a new plot</h1>
                    <p className="newplot-intro">Choose a patch of earth and add it to your map!.</p>
                </div>
            </header>
            <div className="newplot-layout">
                <section className="newplot-map-panel">
                    <div className="newplot-panel-heading">
                        <div><p className="newplot-label">STEP 01</p><h2>Set Plot Location</h2></div>
                        <span className="newplot-status">{coords ? "LOCATION SET" : "AWAITING PIN"}</span>
                    </div>
                    <div className="newplot-map-frame">
                        <MapContainer center={[51.505, -0.09]} zoom={13} className="newplot-map">
                            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                            <LocationPicker coords={coords} setCoords={setCoords}/>
                        </MapContainer>
                    </div>
                    <div className="newplot-map-footer">
                        <p>{coords ? "Pin locked. You can move it by clicking another spot." : "Click anywhere on the map to place your pin."}</p>
                        <button className="newplot-location-button" type="button" onClick={getCurrentLocation} disabled={isLocating}>
                            <span aria-hidden="true">+</span> {isLocating ? "SEARCHING..." : "USE MY LOCATION"}
                        </button>
                    </div>
                </section>
                <form className="newplot-form" onSubmit={handleSubmit}>
                    <div className="newplot-panel-heading">
                        <div><p className="newplot-label">STEP 02</p><h2>Record the details</h2></div>
                    </div>
                    {locationError && <p className="newplot-error" role="alert">{locationError}</p>}
                    <label>Plot name<input type="text" name="plot_name" value={plot.plot_name} onChange={handleChange} placeholder="e.g. Rooftop meadow" required /></label>
                    <div className="newplot-form-grid">
                        <label>Area (m2)<input type="number" name="area_sq_m" value={plot.area_sq_m} onChange={handleChange} placeholder="Optional" min="0" /></label>
                        <label>Sunlight<select name="sun_shade" value={plot.sun_shade} onChange={handleChange}><option value="">Choose one</option><option value="full_sun">Full sun</option><option value="partial_shade">Partial shade</option><option value="full_shade">Full shade</option></select></label>
                    </div>
                    <label>Habitat type<select name="plot_type" value={plot.plot_type} onChange={handleChange}><option value="">Choose one</option><option value="1">Balcony Pot</option><option value="2">Small Garden</option><option value="3">Large Garden</option><option value="4">Allotment</option></select></label>
                    <button className="newplot-submit" type="submit"><span>CREATE NEW PLOT</span><span aria-hidden="true">&gt;</span></button>
                </form>
            </div>
        </main>
    )
}

export default NewPlot