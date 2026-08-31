import { useState } from "react"
import { logQuest } from "../api"

const QuestCard = ({quest, plotId, onSubmitted}) => {

    const [active, setActive] = useState()
    const [image, setImage] = useState()
    const [expandedSteps, setExpandedSteps] = useState(null)

    const plantQuest = quest.plant_quest
    const nestingQuest = quest.nesting_quest

    const handleFileChange = (e) => {
        setImage(e.target.files[0])
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('plot_id', plotId)
        formData.append('photo', image)

        if (active === 'plant') {
            formData.append('plant_id', plantQuest.plant_id)
        } else {
            formData.append('action_id', nestingQuest.action_id)
        }

        const result = await logQuest(formData)
        console.log(result)

        setActive(null)
        setImage(null)
        onSubmitted?.()
    }

    const renderQuestCard = ({
        type,
        title,
        name,
        description,
        link,
        details,
        steps,
        actionLabel,
        points,
    }) => {
        const isStepsExpanded = expandedSteps === type
        const parseSteps = (stepsText) => {
            if (!stepsText) return []
            return stepsText.split(/\d+\.\s+/).filter(step => step.trim())
        }
        const parsedSteps = steps ? parseSteps(steps) : []

        return (
        <div className="plotdetail-quest-card" key={type}>
            <div className="plotdetail-quest-card__header">
                <span className="plotdetail-quest-card__title">
                    {type === 'plant' ? '🌱' : '🐝'} {title}
                </span>
                <a
                    href={link || '#'}
                    className="plotdetail-quest-card__link"
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Learn more about ${name}`}
                >
                    ?
                </a>
            </div>

            <div className="plotdetail-quest-card__name">{name}</div>
            <p className="plotdetail-quest-card__description">{description}</p>

            <div className="plotdetail-quest-card__meta">
                {details.map((item) => (
                    <span key={`${type}-${item}`}>{item}</span>
                ))}
                {steps && (
                    <button 
                        type="button"
                        className="plotdetail-quest-card__steps-trigger"
                        onClick={() => setExpandedSteps(isStepsExpanded ? null : type)}
                    >
                        Steps available &gt;
                    </button>
                )}
            </div>

            {isStepsExpanded && steps && (
                <div className="plotdetail-quest-card__steps-expanded">
                    <ol className="plotdetail-quest-card__steps-list">
                        {parsedSteps.map((step, index) => (
                            <li key={index}>{step.trim()}</li>
                        ))}
                    </ol>
                </div>
            )}

            <div className="plotdetail-quest-card__bottom">
                <span className="plotdetail-quest-card__points">{points}</span>
                <button type="button" className="plotdetail-quest-card__action" onClick={() => setActive(type)}>
                    {actionLabel}
                </button>
            </div>

            {active === type && (
                <div className="plotdetail-quest-card__active-form">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="plotdetail-quest-card__file" />
                    <button type="button" className="plotdetail-quest-card__submit" onClick={handleSubmit}>Submit photo</button>
                </div>
            )}
        </div>
        )
    }

    return (
        <>
            {renderQuestCard({
                type: 'plant',
                title: 'Plant quest',
                label: 'Plant quest',
                name: `${plantQuest?.common_name || 'Unknown'} (${plantQuest?.plant_name || ''})`,
                description: plantQuest?.notes || 'A perfect plant for your plot.',
                link: plantQuest?.rhs_link,
                badge: plantQuest?.sun_shade || plantQuest?.native_status,
                details: [
                    plantQuest?.native_status ? `Native: ${plantQuest.native_status}` : '',
                    plantQuest?.bloom_season ? `Bloom: ${plantQuest.bloom_season}` : '',
                    plantQuest?.hardiness ? `Hardiness: ${plantQuest.hardiness}` : '',
                ].filter(Boolean),
                actionLabel: 'I planted this!',
                points: `${plantQuest?.points ?? 0} pts`,
            })}

            {renderQuestCard({
                type: 'nesting',
                title: 'Nesting quest',
                label: 'Nesting quest',
                name: nestingQuest?.action || 'Nesting quest',
                description: nestingQuest?.notes || 'Support local pollinators and habitat health.',
                link: nestingQuest?.url,
                badge: nestingQuest?.plot_type ? `Plot type ${nestingQuest.plot_type}` : 'Habitat action',
                details: [],
                steps: nestingQuest?.steps,
                actionLabel: 'I built this!',
                points: `${nestingQuest?.points ?? 0} pts`,
            })}
        </>
    )
}
export default QuestCard

