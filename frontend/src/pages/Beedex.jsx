import { useEffect, useState } from "react"
import { useRef } from "react"
import { getBeedex, getUserBeedex } from "../api"
import SpeciesCard from "../components/SpeciesCard"
import "./Beedex.css"

const Beedex = () => {
    const [loading, setLoading] = useState(true)
    const [showUnlocked, setShowUnlocked] = useState(false)
    const [beedex, setBeedex] = useState([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const carouselRef = useRef(null)

    useEffect(() => {
        const fetchBeedex = async() => {
            setLoading(true)
            setBeedex([])
            try {
                const data = showUnlocked ? await getBeedex() : await getUserBeedex()
                setBeedex(data)
            } catch {
                setBeedex([])
            } finally {
                setLoading(false)
            }
        }
        fetchBeedex()
    }, [showUnlocked])

    const handleCarouselScroll = () => {
        const viewport = carouselRef.current
        if (!viewport) return
        const slideHeight = viewport.querySelector(".beedex-carousel__slide")?.getBoundingClientRect().height || 1
        const columnCount = getComputedStyle(viewport.querySelector(".beedex-carousel__container")).gridTemplateColumns.split(" ").length
        setSelectedIndex(Math.min(beedex.length - 1, Math.floor(viewport.scrollTop / (slideHeight + 16)) * columnCount))
    }

    const handleFilterChange = (showAll) => {
        setSelectedIndex(0)
        setShowUnlocked(showAll)
    }

    if(loading){
        return <main className="beedex-page"><p className="beedex-status">Loading beedex...</p></main>
    }

    return(
        <main className="beedex-page">
            <header className="beedex-header">
                <div>
                    <p className="beedex-kicker">FIELD GUIDE / COLLECTION</p>
                    <h1>Bee-dex</h1>
                    <p className="beedex-subtitle">Meet the pollinators in your neighborhood.</p>
                </div>
                <div className="beedex-counter" aria-label={`${beedex.length} bees shown`}>
                    <strong>{beedex.length}</strong>
                    <span>BEES</span>
                </div>
            </header>

            <nav className="beedex-filter" aria-label="Bee collection filter">
                <button
                    className={showUnlocked ? "beedex-filter__button is-active" : "beedex-filter__button"}
                    onClick={() => handleFilterChange(true)}
                    type="button"
                >
                    All bees
                </button>
                <button
                    className={!showUnlocked ? "beedex-filter__button is-active" : "beedex-filter__button"}
                    onClick={() => handleFilterChange(false)}
                    type="button"
                >
                    Discovered
                </button>
            </nav>

            {beedex.length === 0 ? (
                <p className="beedex-status">No discovered species yet. Start exploring to fill your collection.</p>
            ) : (
                <div className="beedex-carousel">
                    <div className="beedex-carousel__toolbar">
                        <span className="beedex-carousel__prompt">Scroll to explore entries</span>
                        <span className="beedex-carousel__position">{selectedIndex + 1} / {beedex.length}</span>
                    </div>
                    <div className="beedex-carousel__viewport" ref={carouselRef} onScroll={handleCarouselScroll}>
                        <div className="beedex-carousel__container">
                            {beedex.map((species, index) =>
                                <div className="beedex-carousel__slide" key={species.species_id}>
                                    <SpeciesCard species={species} number={index + 1} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="beedex-carousel__dots" aria-label="Bee entries">
                        {beedex.map((species, index) =>
                            <button
                                className={index === selectedIndex ? "beedex-carousel__dot is-active" : "beedex-carousel__dot"}
                                key={species.species_id}
                                onClick={() => carouselRef.current?.children[0]?.children[index]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })}
                                type="button"
                                aria-label={`Go to bee ${index + 1}`}
                            />
                        )}
                    </div>
                </div>
            )}
        </main>
    )
}

export default Beedex