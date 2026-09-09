import './LoadingState.css'

const LoadingState = ({ routeName }) => (
    <main className="loading-state" aria-live="polite">
        <p>Loading {routeName}...</p>
    </main>
)

export default LoadingState
