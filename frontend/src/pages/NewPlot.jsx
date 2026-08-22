import { useState } from "react"
import { newPlot } from "../api"
import { useNavigate } from "react-router-dom"

// ADD PLOT NAME TO DB MODEL

const NewPlot = () =>{
    const [plot, setPlot] = useState({latitude:'', longitude: '', sun_shade:'', plot_type: '', area_sq_m:''})
    const [data, setData] = useState('')
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
    const data = await newPlot(plot)
    setData(data)
    console.log(data)
    navigate(`/plots`)
    }

    return(
        <>
        <form onSubmit={handleSubmit}>
            <input 
                type="number"
                name="latitude"
                value={plot.latitude}
                onChange={handleChange}
                placeholder="Latitude"
            />
            <input 
                type="number"
                name="longitude"
                value={plot.longitude}
                onChange={handleChange}
                placeholder="Longitude"
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