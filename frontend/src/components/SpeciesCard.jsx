const SpeciesCard = ({species}) => {
    return(
        <>
        {species.latest_image && (
            <img
                src={species.latest_image.url}
                alt={`Photo of ${species.common_name}`}
            />
        )}
        <h1>{species.common_name}</h1>
        <p><em>{species.scientific_name}</em></p>
        <p>{species.fun_facts}</p>
        </>
    )
}
export default SpeciesCard