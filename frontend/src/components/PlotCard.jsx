import { Link } from "react-router-dom"
import ProgressBar from './ProgressBar'
import { getProgressToNextMilestone, MILESTONE_THRESHOLDS } from '../utils/milestones'
import seedlingImage from '../assets/seedling.png'
import sanctuaryImage from '../assets/sanctuary.png'

const PlotCard = ({ plot }) => {
    const plotMap = {1:'balcony pot',2:'small garden',3:'large garden',4:'allotment'}
    const { pointsToNext } = getProgressToNextMilestone(plot.milestone, plot.points)
    const currentPoints = Number(plot.points) || 0
    const milestone = String(plot.milestone || 'Seedling').trim()
        .replace(/^./, (letter) => letter.toUpperCase())
    const plotImage = milestone === 'Seedling'
        ? seedlingImage
        : milestone === 'Sanctuary'
            ? sanctuaryImage
            : seedlingImage
    const threshold = MILESTONE_THRESHOLDS[milestone]
    const nextMilestone = Object.keys(MILESTONE_THRESHOLDS).find(m => 
        threshold && MILESTONE_THRESHOLDS[m].lower === threshold.upper
    ) || milestone
    
    return(
        <div className="plot-card-content">
            <h3 className="plot-card-name">{plot.plot_name}</h3>
            <div className="plot-card-points-row">
                <span className="plot-card-points-current">{currentPoints} pts</span>
                <span className="plot-card-points-next">{pointsToNext} to {nextMilestone}</span>
            </div>
            <ProgressBar milestone={milestone} points={plot.points} />
            <p className="plot-card-type-badge">{plotMap[plot.plot_type]}</p>
            <Link to={`/plot/${plot.id}`} className="plot-card-link">
                <img src={plotImage} alt={`${milestone} plot`} className="plot-card-image" />
            </Link>
        </div>
    )
}

export default PlotCard
