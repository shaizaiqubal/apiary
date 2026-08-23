const SpeciesCard = ({species}) => {
    return(
        <>
        <h1>{species.common_name}</h1>
        <p><em>{species.scientific_name}</em></p>
        <p>{species.fun_facts}</p>
        </>
    )
}
export default SpeciesCard