import { Link } from "react-router-dom"

const PlotCard = ({ plot }) => {
    const plotMap = {1:'balcony pot',2:'small garden',3:'large garden',4:'allotment'}
    return(
        <>
        <h3>{plot.plot_name}</h3>
        <p>{plotMap[plot.plot_type]}</p>
        <Link to={`/plot/${plot.id}`}>Go to plot</Link>
        </>
    )
}

export default PlotCard