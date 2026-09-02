import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getPlot, getQuest } from "../api"
import QuestCard from "../components/QuestCard"
import SightingOverlay from "../components/SightingOverlay"
import ProgressBar from "../components/ProgressBar"
import "./PlotDetail.css"

const PlotDetail = () => {

    const { plotId } = useParams()
    const [plot, setPlot] = useState({})
    const [quest, setQuest] = useState({})
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
        setShowQuest(false)
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

    const milestoneThresholds = {
        Seedling: 500,
        Garden: 1250,
        Habitat: 2500,
        Sanctuary: null,
    }

    const currentMilestone = plot.milestone || 'Seedling'
    const nextThreshold = milestoneThresholds[currentMilestone]
    const pointsToNext = nextThreshold === null ? 0 : Math.max(nextThreshold - (plot.points || 0), 0)

    const activityLog = [
        ...(plot.quests ?? []).map((item) => ({
            id: item.id,
            label: item.plant_id ? `Plant ${item.plant_id}` : `Action ${item.action_id}`,
            points: `+${item.points_awarded}`,
        })),
        ...confirmedSightings.map((item) => ({
            id: `sighting-${item.id}`,
            label: `Species ${item.species_id ?? 'unknown'}`,
            points: `+${item.points_awarded}`,
        })),
    ]

    return(
        <div className="plotdetail-page">
            <header className="plotdetail-header-card">
                <div className="plotdetail-header-row">
                    <h1 className="plotdetail-title">{plot.plot_name}</h1>
                    <span className={`plotdetail-badge plotdetail-badge--${plot.milestone || 'Seedling'}`}>
                        {plot.milestone || 'Seedling'}
                    </span>
                </div>

                <div className="plotdetail-points-row">
                    <strong>{plot.points ?? 0} / {nextThreshold ?? (plot.points ?? 0)} pts</strong>
                    <span>{nextThreshold ? `${pointsToNext} pts to next tier` : 'Final tier reached'}</span>
                </div>

                <ProgressBar milestone={plot.milestone || 'Seedling'} points={plot.points ?? 0} />

                <div className="plotdetail-points-caption">
                    {nextThreshold ? `${pointsToNext} points to ${currentMilestone === 'Seedling' ? 'Garden' : currentMilestone === 'Garden' ? 'Habitat' : 'Sanctuary'} tier` : 'Sanctuary is the final tier.'}
                </div>
            </header>

            <section className="plotdetail-stats" aria-label="Plot stats">
                <div className="plotdetail-stat">
                    <span className="plotdetail-stat__label">Sun / shade</span>
                    <strong>{plot.sun_shade}</strong>
                </div>
                <div className="plotdetail-stat">
                    <span className="plotdetail-stat__label">Plot type</span>
                    <strong>{plotMap[plot.plot_type] || 'Unknown'}</strong>
                </div>
                <div className="plotdetail-stat">
                    <span className="plotdetail-stat__label">Area</span>
                    <strong>{plot.area_sq_m ?? '—'} sq m</strong>
                </div>
                {/* <div className="plotdetail-stat">
                    <span className="plotdetail-stat__label">Region</span>
                    <strong>{plot.region || 'Unknown'}</strong>
                </div> */}
            </section>

            <section className="plotdetail-section">
                <div className="plotdetail-section__header">
                    <h3>QUESTS</h3>
                    <button className="plotdetail-quest-trigger" type="button" onClick={fetchQuest}>Get a quest</button>
                </div>

                {showQuest && quest?.plant_quest && quest?.nesting_quest ? (
                    <div className="plotdetail-quest-grid">
                        <QuestCard quest={quest} plotId={plotId} onSubmitted={handleQuestSubmitted} />
                    </div>
                ) : (
                    <div className="plotdetail-quest-grid">
                        <div className="plotdetail-quest-card">
                            <div className="plotdetail-quest-card__header">
                                <div className="plotdetail-quest-card__label-wrap">
                                    <span className="plotdetail-quest-card__icon">🌱</span>
                                    <span>Plant quest</span>
                                </div>
                                <a href="https://www.rhs.org.uk/" className="plotdetail-quest-card__link" target="_blank" rel="noreferrer">?</a>
                            </div>
                            <div className="plotdetail-quest-card__name">No quest loaded</div>
                            <p className="plotdetail-quest-card__description">Tap “Get a quest” to generate a plant recommendation.</p>
                        </div>

                        <div className="plotdetail-quest-card">
                            <div className="plotdetail-quest-card__header">
                                <div className="plotdetail-quest-card__label-wrap">
                                    <span className="plotdetail-quest-card__icon">🐝</span>
                                    <span>Nesting quest</span>
                                </div>
                                <a href="https://www.rhs.org.uk/" className="plotdetail-quest-card__link" target="_blank" rel="noreferrer">?</a>
                            </div>
                            <div className="plotdetail-quest-card__name">No quest loaded</div>
                            <p className="plotdetail-quest-card__description">Tap “Get a quest” to generate a nesting recommendation.</p>
                        </div>
                    </div>
                )}
            </section>

            <button className="plotdetail-sighting-button" type="button" onClick={() => setShowSighting(true)}>
                I found a bee!
            </button>
            {showSighting && <SightingOverlay plotId={plotId} onClose={() => setShowSighting(false)} />}

            <section className="plotdetail-log">
                <h3>Activity log</h3>
                {activityLog.length ? (
                    <ul className="plotdetail-log-list">
                        {activityLog.map((item) => (
                            <li key={item.id} className="plotdetail-log-item">
                                <span className="plotdetail-log-item__label">{item.label}</span>
                                <span className="plotdetail-log-item__points">{item.points}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No activity yet.</p>
                )}
            </section>
        </div>
    )
}

export default PlotDetail