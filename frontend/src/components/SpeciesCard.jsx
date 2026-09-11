import { beeImageExtensions } from "../utils/beeImages"

const SpeciesCard = ({species, number, discovered, onSelect}) => {
    const rarity = String(species.rarity_tier || "Common").toLowerCase()
    const imagePath = `/bees/${species.species_id}.${beeImageExtensions[species.species_id] || 'png'}`

    return(
        <article className={`species-card species-card--${rarity}${discovered ? " species-card--discovered" : " species-card--undiscovered"}`} onClick={onSelect} onKeyDown={(event) => event.key === "Enter" && onSelect?.()} role="button" tabIndex="0" aria-label={`Open details for ${species.common_name}`}>
            <div className="species-card__topline">
                <span className="species-card__number">#{String(number).padStart(2, "0")}</span>
                <span className={`species-card__rarity species-card__rarity--${species.rarity_tier.toLowerCase()}`}>
                    {species.rarity_tier}
                </span>
            </div>
            <div className="species-card__illustration" aria-hidden="true">
                <img
                    className="species-card__image"
                    src={imagePath}
                    alt=""
                    onError={(event) => {
                        if (event.currentTarget.dataset.fallback) return
                        event.currentTarget.dataset.fallback = "true"
                        event.currentTarget.src = "/bees/default-bee.jpg"
                    }}
                />
                <span className="species-card__bee">BEE</span>
            </div>
            <div className="species-card__details">
                <h2>{species.common_name}</h2>
                <p className="species-card__scientific"><em>{species.scientific_name}</em></p>
                <p className="species-card__fact">{species.fun_facts}</p>
                <div className="species-card__points">
                    <span>FIELD POINTS</span>
                    <strong>+{species.points}</strong>
                </div>
            </div>
        </article>
    )
}
export default SpeciesCard
