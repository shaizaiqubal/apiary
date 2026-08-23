import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getPlot, getQuest } from "../api"
import QuestCard from "../components/QuestCard"

const PlotDetail = () => {

    const { plotId } = useParams()
    const [plot, setPlot] = useState([])
    const [quest, setQuest] = useState([])
    const [showQuest, setShowQuest] = useState(false)

    const fetchQuest = async() => {
        const data = await getQuest(plotId)
        setQuest(data)
        setShowQuest(true)
    }
    
    useEffect(() => {
        const fetchPlot = async() => {
            const data = await getPlot(plotId)
            setPlot(data)
        }
        fetchPlot()
    }, [plotId])

    const plotMap = {1:'balcony pot',2:'small garden',3:'large garden',4:'allotment'}
    return(
        <>
        <h3>{plotMap[plot.plot_type]}</h3>
        <p>latitude: {plot.latitude}</p>
        <p>longitude: {plot.longitude}</p>
        <p>sun: {plot.sun_shade}</p>
        <p>area: {plot.area_sq_m}</p>
        <p>milestone: {plot.milestone}</p>
        <p>points: {plot.points}</p>
        <h4>Quests</h4>
        {plot.quests?.length ? (
            <ul>
                {plot.quests.map((quest) => (
                    <li key={quest.id}>
                        {quest.plant_id ? `Plant ${quest.plant_id}` : `Action ${quest.action_id}`} - {quest.verified_status} ({quest.points_awarded} points)
                    </li>
                ))}
            </ul>
        ) : (
            <p>No quests yet.</p>
        )}
        <h4>Sightings</h4>
        {plot.sightings?.length ? (
            <ul>
                {plot.sightings.map((sighting) => (
                    <li key={sighting.id}>
                        Species {sighting.species_id ?? 'unknown'} - {sighting.verified_status} ({sighting.points_awarded} points)
                    </li>
                ))}
            </ul>
        ) : (
            <p>No sightings yet.</p>
        )}

        <button onClick={fetchQuest}>Get a Quest!</button>
        {showQuest && <QuestCard quest={quest} plotId={plotId}/>} 
        </>

        
    )
}

export default PlotDetail