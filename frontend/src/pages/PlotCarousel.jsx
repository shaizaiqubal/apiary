import { useEffect } from "react"
import { useState } from "react"
import { getPlots } from "../api"

const PlotCarousel = () => {

    const [ plots, setPlots ] = useState()
    useEffect(() => {
        const fetchPlots = async() => {
            const data = await getPlots()
            setPlots(data)
        }
        fetchPlots()
    }, [])
    console.log(plots)
    
    return <p>{JSON.stringify(plots)}</p>
}

export default PlotCarousel
