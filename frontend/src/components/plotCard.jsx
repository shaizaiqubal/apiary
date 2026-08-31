import { Link } from "react-router-dom"
import ProgressBar from './ProgressBar'
import { getProgressToNextMilestone, MILESTONE_THRESHOLDS } from '../utils/milestones'

const PlotCard = ({ plot }) => {
    const plotMap = {1:'balcony pot',2:'small garden',3:'large garden',4:'allotment'}
    const { pointsToNext } = getProgressToNextMilestone(plot.milestone, plot.points)
    const currentPoints = Number(plot.points) || 0
    const milestone = plot.milestone || 'Seedling'
    const nextMilestone = Object.keys(MILESTONE_THRESHOLDS).find(m => 
        MILESTONE_THRESHOLDS[m].lower === MILESTONE_THRESHOLDS[milestone].upper
    ) || milestone
    
    return(
        <div className="plot-card-content">
            <h3 className="plot-card-name">{plot.plot_name}</h3>
            <div className="plot-card-points-row">
                <span className="plot-card-points-current">{currentPoints} pts</span>
                <span className="plot-card-points-next">{pointsToNext} to {nextMilestone}</span>
            </div>
            <ProgressBar milestone={plot.milestone} points={plot.points} />
            <p className="plot-card-type-badge">{plotMap[plot.plot_type]}</p>
            <Link to={`/plot/${plot.id}`} className="plot-card-link">
                <img src="/src/assets/test.png" alt="Go to plot" className="plot-card-image" />
            </Link>
        </div>
    )
}

export default PlotCard