import useUserId from '../hooks/getUserId'
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api'
    
const HomePage = () => {
    return(
        <>
        <h1>APIARY</h1>
        <Link to='/plots'>Go to Plots</Link>
        </>
    )
}

const RegisterPage = () => {
    const navigate = useNavigate()
    const registerNewUser = () => {
        
            const apiaryUuid = crypto.randomUUID()
            registerUser()
            
            localStorage.setItem('apiary_uuid',apiaryUuid)
        
    
        navigate("/plot/new")
    }
    return(
        <>
        <h1>APIARY</h1>
        <p>It looks like you have no plots yet!</p>
        <button onClick={registerNewUser}>Create Your First Plot!</button>
        </>
    )
}
const Home = () => {

    const apiaryUuid = useUserId()
    if(apiaryUuid){
        return <HomePage/> 
    }
    else{
        return <RegisterPage/>
    }
}
export default Home