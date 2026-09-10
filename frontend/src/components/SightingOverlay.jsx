import { useState } from "react";
import { confirmSighting, logSighting } from "../api";
import "./SightingOverlay.css";

const SightingSheet = ({ children, isMinimized, onMinimize, onClose }) => {
    return (
        <div className="sighting-overlay" role="dialog" aria-modal="true" aria-label="Bee sighting">
            <button className={`sighting-overlay__backdrop ${isMinimized ? "is-minimized" : ""}`} type="button" onClick={onClose} aria-label="Close sighting overlay" />
            <section className={`sighting-overlay__sheet ${isMinimized ? "is-minimized" : ""}`}>
                <div className="sighting-overlay__header">
                    <div>
                        <h2>Bee sighting</h2>
                    </div>
                    <div className="sighting-overlay__controls">
                        <button type="button" onClick={onMinimize} aria-label={isMinimized ? "Expand sighting overlay" : "Minimize sighting overlay"}>
                            {isMinimized ? "+" : "-"}
                        </button>
                        <button type="button" onClick={onClose} aria-label="Close sighting overlay">x</button>
                    </div>
                </div>
                {!isMinimized && <div className="sighting-overlay__body">{children}</div>}
            </section>
        </div>
    )
}

const CandidateList = ({ candidates, selectedId, onSelect }) => (
    <div className="sighting-overlay__candidates" aria-label="Possible bee species">
        {candidates?.map((candidate) => (
            <label className="sighting-overlay__candidate" key={candidate.species_id}>
                <input
                    type="radio"
                    name="species_id"
                    value={candidate.species_id}
                    checked={selectedId === candidate.species_id}
                    onChange={() => onSelect(candidate.species_id)}
                    required
                />
                <span className="sighting-overlay__candidate-info">
                    <strong>{candidate.common_name}</strong>
                    <em>{candidate.species_name}</em>
                </span>
                <span className="sighting-overlay__confidence">{Math.round(candidate.confidence * 100)}%</span>
            </label>
        ))}
    </div>
)

const SightingOverlay = ({ plotId, onClose }) =>{
    const [phase, setPhase] = useState("capture") //capture || confirm || result || loading
    const [image, setImage] = useState(null)
    const [candidates, setCandidates] = useState(null)
    const [result, setResult] = useState(null)
    const [sightingId,setSightingId] = useState(null)
    const [speciesId,setSpeciesId] = useState(null)
    const [isMinimized, setIsMinimized] = useState(false)
    const [error, setError] = useState('')

    const getErrorMessage = (requestError, fallback) => (
        requestError.response?.data?.detail || fallback
    )

    const handleFileChange = (e) =>{
        setImage(e.target.files[0])
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        setError('')
        setPhase("loading")
        const formData = new FormData
        formData.append('plot_id', plotId)
        formData.append('photo',image)

        try {
            const data = await logSighting(formData)
            setCandidates(data)
            setSightingId(data.sighting_id)
            setPhase("confirm")
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'The bee image could not be processed.'))
            setPhase("capture")
        }
    }

    const handleSpeciesSubmit = async(e) => {
        e.preventDefault()
        setError('')
        setPhase("loading")
        try {
            const data = await confirmSighting(sightingId,speciesId)
            setResult(data)
            setPhase("result")
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'The sighting could not be confirmed.'))
            setPhase("confirm")
        }
    }
    let content = null

    if(phase==="capture"){
        content = (
            <form onSubmit={handleSubmit} className="sighting-overlay__form">
                <p className="sighting-overlay__prompt">Upload a photo to identify the bee.</p>
                {error && <p className="sighting-overlay__message sighting-overlay__message--error">{error}</p>}
                <input className="sighting-overlay__file" type="file" accept="image/*" onChange={handleFileChange} required/>
                <button className="sighting-overlay__action sighting-overlay__submit" type="submit">Submit photo</button>
            </form>
        )
    }
    if(phase==="confirm"){
        if(candidates.status === "declined" || candidates.status === "not_a_bee"){
            content = <p className="sighting-overlay__message sighting-overlay__message--rejected">Rejected: {candidates.reason}</p>
        } else {
            content = (
                <form onSubmit={handleSpeciesSubmit} className="sighting-overlay__form sighting-overlay__form--confirmation">
                    <p className="sighting-overlay__prompt">What species do you think it is?</p>
                    {error && <p className="sighting-overlay__message sighting-overlay__message--error">{error}</p>}

                    <CandidateList candidates={candidates.candidates} selectedId={speciesId} onSelect={setSpeciesId} />

                    <button className="sighting-overlay__action" type="submit">
                        Confirm
                    </button>
                </form>
            )
        }
    }

    if(phase==="result"){
        const confirmedSpecies = candidates?.candidates?.find(
            (candidate) => candidate.species_id === speciesId
        )
        content = (
            <div className="sighting-overlay__result">
                <h3 className="sighting-overlay__result-title">Sighting confirmed</h3>
                <div className="sighting-overlay__result-summary">
                    <div className="sighting-overlay__result-row">
                        <span>Points awarded</span>
                        <strong>+{result?.points_awarded ?? 0}</strong>
                    </div>
                    <div className="sighting-overlay__result-row">
                        <span>Species name</span>
                        <strong>{confirmedSpecies?.species_name || "Unknown"}</strong>
                    </div>
                    <div className="sighting-overlay__result-row">
                        <span>Common name</span>
                        <strong>{confirmedSpecies?.common_name || "Unknown"}</strong>
                    </div>
                </div>
                <button className="sighting-overlay__action" type="button" onClick={onClose}>
                    Dismiss
                </button>
            </div>
        )
    }

    if(phase==="loading"){
        content = <p className="sighting-overlay__message">Loading...</p>
    }

    return (
        <SightingSheet
            isMinimized={isMinimized}
            onMinimize={() => setIsMinimized((minimized) => !minimized)}
            onClose={onClose}
        >
            {content}
        </SightingSheet>
    )

}

export default SightingOverlay
