import { Link } from "react-router-dom"

const plotCard = ({ plot }) => {
    const plotMap = {1:'balcony pot',2:'small garden',3:'large garden',4:'allotment'}
    return(
        <>
        <h3>{plotMap[plot.plot_type]}</h3>
        <Link to={`/plot/${plot.id}`}>Go to plot</Link>
        </>
    )
}

export default plotCard