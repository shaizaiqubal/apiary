import useUserId from '../hooks/getUserId'
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api'
import './Home.css'
    
const HomePage = () => {
    return(
        <div className="home-page">
        <img src="/src/assets/logo.png" alt="APIARY logo" className="home-logo" />
        <Link to='/plots' className="home-action-link">Go to Plots</Link>
        </div>
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
        <div className="register-page">
        <img src="/src/assets/logo.png" alt="APIARY logo" className="home-logo" />
        <p>It looks like you have no plots yet!</p>
        <button onClick={registerNewUser} className="home-action-button" type="button">
          Create Your First Plot!
        </button>
        </div>
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