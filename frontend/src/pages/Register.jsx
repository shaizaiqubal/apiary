import { useEffect } from 'react'
import { registerUser } from '../api'
import { Link } from 'react-router-dom'

const Register = () => {
    useEffect( () => {
        const apiaryUuid = crypto.randomUUID()
        registerUser()
        
        localStorage.setItem('apiary_uuid',apiaryUuid)
    }, [])

    return(
        <>
        <h3>All done!</h3>
        <Link to='/plots'>Go to plots</Link>
        </>
    )
}

export default Register