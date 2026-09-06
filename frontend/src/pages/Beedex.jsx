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
    const [selectedBee, setSelectedBee] = useState(null)
    const [sortMode, setSortMode] = useState("serial")
    const carouselRef = useRef(null)

    const rarityOrder = { shiny: 1, rare: 2, uncommon: 3, common: 4, legendary: 0 }
    const sortedBeedex = [...beedex].sort((leftBee, rightBee) => {
        if (sortMode === "rarity") {
            const rarityDifference = (rarityOrder[String(leftBee.rarity_tier).toLowerCase()] || 99) - (rarityOrder[String(rightBee.rarity_tier).toLowerCase()] || 99)
            if (rarityDifference !== 0) return rarityDifference
        }
        return Number(leftBee.species_id) - Number(rightBee.species_id)
    })

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

    const toggleFilter = () => {
        setSelectedIndex(0)
        setSelectedBee(null)
        setShowUnlocked((currentValue) => !currentValue)
    }

    const handleSortChange = (event) => {
        setSortMode(event.target.value)
        setSelectedIndex(0)
        setSelectedBee(null)
        carouselRef.current?.scrollTo({ top: 0, behavior: "smooth" })
    }

    useEffect(() => {
        if (!selectedBee) return undefined
        const handleKeyDown = (event) => {
            if (event.key === "Escape") setSelectedBee(null)
        }
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [selectedBee])

    if(loading){
        return <main className="beedex-page"><p className="beedex-status">Loading beedex...</p></main>
    }

    return(
        <main className="beedex-page">
            <header className="beedex-header">
                <div>
                    <h1>Bee-dex</h1>
                    <p className="beedex-subtitle">Meet the pollinators in your neighborhood.</p>
                </div>
                <div className="beedex-counter" aria-label={`${beedex.length} bees shown`}>
                    <strong>{beedex.length}</strong>
                    <span>BEES</span>
                </div>
            </header>

            <nav className="beedex-filter" aria-label="Bee collection filter and sorting">
                <button className="beedex-filter__button" onClick={toggleFilter} type="button" aria-pressed={showUnlocked}>
                    {showUnlocked ? "Show discovered" : "Show all bees"}
                </button>
                <label className="beedex-sort">
                    <span>Sort by</span>
                    <select value={sortMode} onChange={handleSortChange} aria-label="Sort bees by">
                        <option value="serial">Serial no.</option>
                        <option value="rarity">Rarity</option>
                    </select>
                </label>
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
                            {sortedBeedex.map((species, index) =>
                                <div className="beedex-carousel__slide" key={species.species_id}>
                                    <SpeciesCard species={species} number={species.species_id || index + 1} onSelect={() => setSelectedBee({ species, number: species.species_id || index + 1 })} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {selectedBee && (
                <div className="beedex-modal" role="presentation" onClick={() => setSelectedBee(null)}>
                    <section className={`beedex-modal__panel beedex-modal__panel--${String(selectedBee.species.rarity_tier || "common").toLowerCase()}`} role="dialog" aria-modal="true" aria-labelledby="beedex-modal-title" onClick={(event) => event.stopPropagation()}>
                        <button className="beedex-modal__close" type="button" onClick={() => setSelectedBee(null)} aria-label="Close bee details">×</button>
                        <div className={`beedex-modal__rarity beedex-modal__rarity--${String(selectedBee.species.rarity_tier || "common").toLowerCase()}`}>
                            {selectedBee.species.rarity_tier} ENTRY
                        </div>
                        <div className="beedex-modal__content">
                            <div className="beedex-modal__image-wrap">
                                <img
                                    className="beedex-modal__image"
                                    src={selectedBee.species.latest_image?.url || "/bees/default-bee.jpg"}
                                    alt={selectedBee.species.common_name}
                                />
                            </div>
                            <div className="beedex-modal__details">
                                <p className="beedex-modal__number">FIELD GUIDE #{String(selectedBee.number).padStart(2, "0")}</p>
                                <h2 id="beedex-modal-title">{selectedBee.species.common_name}</h2>
                                <p className="beedex-modal__scientific"><em>{selectedBee.species.scientific_name}</em></p>
                                <div className="beedex-modal__stats">
                                    <span>RARITY <strong>{selectedBee.species.rarity_tier}</strong></span>
                                    <span>FIELD XP <strong>+{selectedBee.species.points}</strong></span>
                                </div>
                                <div className="beedex-modal__summary">
                                    <span>FIELD GUIDE SUMMARY</span>
                                    <p>{selectedBee.species.fun_facts}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </main>
    )
}

export default Beedex