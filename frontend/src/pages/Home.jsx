import { useState } from 'react'
import useUserId from '../hooks/getUserId'
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api'
import './Home.css'
    
const HomePage = () => {
    return(
        <div className="home-page">
        <img src="/src/assets/logo.png" alt="APIARY logo" className="home-logo" />
        <Link to='/plots' className="home-action-link">Go to Plots</Link>
        <span className="home-credit">AnimalHack 2026</span>
        </div>
    )
}

const RegisterPage = () => {
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const registerNewUser = async () => {
        const apiaryUuid = crypto.randomUUID()
        localStorage.setItem('apiary_uuid', apiaryUuid)
        setError('')

        try {
            await registerUser()
            navigate("/plot/new")
        } catch {
            localStorage.removeItem('apiary_uuid')
            setError('We could not create your profile. Please try again.')
        }
    }
    return(
        <div className="register-page">
        <img src="/src/assets/logo.png" alt="APIARY logo" className="home-logo" />
        <p>It looks like you have no plots yet!</p>
        {error && <p className="home-register-error" role="alert">{error}</p>}
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
