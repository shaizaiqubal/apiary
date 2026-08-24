import { useState } from "react";
import { confirmSighting, logSighting } from "../api";

const SightingOverlay = ({ plotId, onClose }) =>{
    const [phase, setPhase] = useState("capture") //capture || confirm || result || loading
    const [image, setImage] = useState(null)
    const [candidates, setCandidates] = useState(null)
    const [result, setResult] = useState(null)
    const [sightingId,setSightingId] = useState(null)
    const [speciesId,setSpeciesId] = useState(null)

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
    if(phase==="capture"){
        return(
            <>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="image/*" onChange={handleFileChange} required/>
                <button type="submit">Submit photo</button>
            </form>
            </>
        )
    }
    if(phase==="confirm"){
        if(candidates.status === "declined"){
            return <p>Rejected: {candidates.reason}</p>
        }

        return(
            <>
            <form onSubmit={handleSpeciesSubmit}>
                <p>What species do you think it is?</p>

                <p>
                    {JSON.stringify(candidates.candidates)}
                </p>

                <input
                    type="number"
                    value={speciesId ?? ""}
                    onChange={(e) =>
                        setSpeciesId(Number(e.target.value))
                    }required
                />

                <button type="submit">
                    Confirm
                </button>
            </form>
            </>
        )
    }

    if(phase==="result"){
        return(
            <>
            <p>{JSON.stringify(result)}</p>
             <button type="button" onClick={onClose}>
                Dismiss
            </button>
            </>
        )
    }

    if(phase==="loading"){
        return <p>loading....</p>
    }

    return null

}

export default SightingOverlay