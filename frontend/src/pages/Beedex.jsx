import { useEffect, useState } from "react"
import { getBeedex, getUserBeedex } from "../api"
import SpeciesCard from "../components/SpeciesCard"

const Beedex = () => {
    const [loading, setLoading] = useState(true)
    const [showUnlocked, setShowUnlocked] = useState(false)
    const [beedex, setBeedex] = useState([])

    useEffect(() => {
        const fetchBeedex = async() => {
            const data = showUnlocked ? await getBeedex() : await getUserBeedex()
            setBeedex(data)
            setLoading(false)
        }
        fetchBeedex()
    }, [showUnlocked])

    if(loading){
        return <p>Loading...</p>
    }
    if(beedex.length===0){
        return (
        <>
        <button onClick={() => setShowUnlocked(!showUnlocked)}>
            UwU
        </button>
        <p>No discovered species yet!</p>
        </>)
    }
    return(
        <>
        <button onClick={() => setShowUnlocked(!showUnlocked)}>
            UwU
        </button>
        <div>
            {beedex.map((species) => 
                <SpeciesCard key={species.species_id} species={species} />
            )
            }
        </div>

        </>
    )
}

export default Beedex