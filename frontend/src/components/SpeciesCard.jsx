const SpeciesCard = ({species, number}) => {
    return(
        <article className="species-card">
            <div className="species-card__topline">
                <span className="species-card__number">#{String(number).padStart(2, "0")}</span>
                <span className={`species-card__rarity species-card__rarity--${species.rarity_tier.toLowerCase()}`}>
                    {species.rarity_tier}
                </span>
            </div>
            <div className="species-card__illustration" aria-hidden="true">
                <img
                    className="species-card__image"
                    src={species.latest_image?.url || "/bees/default-bee.jpg"}
                    alt=""
                    onError={(event) => { event.currentTarget.hidden = true }}
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