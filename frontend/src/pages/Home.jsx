import useUserId from '../hooks/getUserId'
import { Link } from 'react-router-dom';

const Home = () => {

    const apiaryUuid = useUserId()
    const buttonText = apiaryUuid ? "View Plots" : "Register"
    const destination = apiaryUuid ? "/plots" : "/register"

    return(
        <>
        <Link to={destination}>{buttonText}</Link>
        </>
    )
}
export default Home