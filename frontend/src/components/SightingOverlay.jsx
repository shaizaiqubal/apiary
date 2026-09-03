import { useState } from "react";
import { confirmSighting, logSighting } from "../api";
import "./SightingOverlay.css";

const SightingSheet = ({ children, isMinimized, onMinimize, onClose }) => {
    return (
        <div className="sighting-overlay" role="dialog" aria-modal="true" aria-label="Bee sighting">
            <button className="sighting-overlay__backdrop" type="button" onClick={onClose} aria-label="Close sighting overlay" />
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

const SightingOverlay = ({ plotId, onClose }) =>{
    const [phase, setPhase] = useState("capture") //capture || confirm || result || loading
    const [image, setImage] = useState(null)
    const [candidates, setCandidates] = useState(null)
    const [result, setResult] = useState(null)
    const [sightingId,setSightingId] = useState(null)
    const [speciesId,setSpeciesId] = useState(null)
    const [isMinimized, setIsMinimized] = useState(false)

    const handleFileChange = (e) =>{
        setImage(e.target.files[0])
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        setPhase("loading")
        const formData = new FormData
        formData.append('plot_id', plotId)
        formData.append('photo',image)

        const data = await logSighting(formData)
        setCandidates(data)
        setSightingId(data.sighting_id)
        setPhase("confirm")
        console.log(data)
    }

    const handleSpeciesSubmit = async(e) => {
        e.preventDefault()
        setPhase("loading")
        const data = await confirmSighting(sightingId,speciesId)
        setResult(data)
        setPhase("result")
    }
    let content = null

    if(phase==="capture"){
        content = (
            <form onSubmit={handleSubmit} className="sighting-overlay__form">
                <p className="sighting-overlay__prompt">Upload a photo to identify the bee.</p>
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

                    <p className="sighting-overlay__candidates">
                        {JSON.stringify(candidates.candidates)}
                    </p>

                    <input
                        className="sighting-overlay__input"
                        type="number"
                        value={speciesId ?? ""}
                        onChange={(e) =>
                            setSpeciesId(Number(e.target.value))
                        } required
                    />

                    <button className="sighting-overlay__action" type="submit">
                        Confirm
                    </button>
                </form>
            )
        }
    }

    if(phase==="result"){
        content = (
            <div className="sighting-overlay__result">
                <p>{JSON.stringify(result)}</p>
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