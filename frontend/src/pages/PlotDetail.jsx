import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getPlot, getQuest } from "../api"
import QuestCard from "../components/QuestCard"
import SightingOverlay from "../components/SightingOverlay"

const PlotDetail = () => {

    const { plotId } = useParams()
    const [plot, setPlot] = useState([])
    const [quest, setQuest] = useState([])
    const [showQuest, setShowQuest] = useState(false)
    const [showSighting, setShowSighting] = useState(false)

    const fetchQuest = async() => {
        const data = await getQuest(plotId)
        setQuest(data)
        setShowQuest(true)
    }

    const handleQuestSubmitted = async () => {
        const data = await getPlot(plotId)
        setPlot(data)
    }
    
    useEffect(() => {
        const fetchPlot = async() => {
            const data = await getPlot(plotId)
            setPlot(data)
        }
        fetchPlot()
    }, [plotId])

    const plotMap = {1:'balcony pot',2:'small garden',3:'large garden',4:'allotment'}
    const confirmedSightings = plot.sightings?.filter(
        (sighting) => sighting.verified_status === 'confirmed'
    ) ?? []

    return(
        <>
        <h3>{plot.plot_name}</h3>
        <p>type: {plotMap[plot.plot_type]}</p>
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
        {confirmedSightings.length ? (
            <ul>
            {confirmedSightings.map((sighting) => (
                    <li key={sighting.id}>
                        Species {sighting.species_id ?? 'unknown'} - {sighting.verified_status} ({sighting.points_awarded} points)
                    </li>
                ))}
            </ul>
        ) : (
            <p>No sightings yet.</p>
        )}

        <button onClick={fetchQuest}>Get a Quest!</button>
        {showQuest && <QuestCard quest={quest} plotId={plotId} onSubmitted={handleQuestSubmitted}/>} 

        <button onClick={() => setShowSighting(true)}>I found a bee!</button>
        {(showSighting) && <SightingOverlay plotId={plotId} onClose={() => setShowSighting(false)} />}

        </>

        
    )
}

export default PlotDetail