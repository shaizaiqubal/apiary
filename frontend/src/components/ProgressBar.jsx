import { getProgressToNextMilestone } from '../utils/milestones'

const ProgressBar = ({ milestone, points }) => {
  const { percent, isMaxTier } = getProgressToNextMilestone(milestone, points)

  return (
    <div className="progress-bar" aria-label={`Progress to next milestone: ${percent}%`}>
      <div className="progress-bar__track">
        <div
          className="progress-bar__fill"
          style={{ width: `${isMaxTier ? 100 : percent}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
