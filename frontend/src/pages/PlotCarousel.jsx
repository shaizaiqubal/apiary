import { useEffect } from "react"
import { useState } from "react"
import { getPlots } from "../api"
import { Link } from "react-router-dom"
import PlotCard from "../components/PlotCard"

const PlotCarousel = () => {

    const [ plots, setPlots ] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPlots = async() => {
            const data = await getPlots()
            setPlots(data)
            setIsLoading(false)
        }
        fetchPlots()
    }, [])

    if (isLoading){
        return(<p>Loading....</p>)
    }
    if (plots.length===0){
        return(
            <>
            <p>You Have no plots yet! </p>
            <Link to='/plot/new'>(+)</Link>
            </>
        )
    }
    
    return(
        <>
            {plots.map((plot) => 
                <PlotCard key={plot.id} plot={plot}/>
            )}
        </>
    )
}

export default PlotCarousel
