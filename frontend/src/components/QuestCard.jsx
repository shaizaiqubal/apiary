import { useState } from "react"
import { logQuest } from "../api"

const QuestCard = ({quest, plotId}) => {

    const [active, setActive] = useState()
    const [image, setImage] = useState()

    const plantQuest = quest.plant_quest
    const nestingQuest = quest.nesting_quest

    const handleFileChange = (e) => {
        setImage(e.target.files[0])
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        const formData = new FormData()
        formData.append('plot_id', plotId)
        formData.append('photo', image)

        if (active === 'plant') {
            formData.append('plant_id', plantQuest.plant_id)
        } else {
            formData.append('action_id', nestingQuest.action_id)
        }

        const result = await logQuest(formData)
        console.log(result)

        setActive(null)
        setImage(null)
    }

    
    return(
        <>
        <h3>Plant Quest</h3>
        <p>{JSON.stringify(plantQuest)}</p>
        <button onClick={() => setActive('plant')}>I planted this!</button>
        <h3>Nesting Quest</h3>
        <p>{JSON.stringify(nestingQuest)}</p>
        <button onClick={() => setActive('nesting')}>I built this!</button>

        {active && (
            <div>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button onClick={handleSubmit} type="submit">Submit photo</button>
            </div>
        )}
        </>
    )
}
export default QuestCard

