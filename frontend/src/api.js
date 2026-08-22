import axios from 'axios'
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000"

const api = axios.create({
    baseURL: apiUrl,
})

api.interceptors.request.use((config) => {
  const apiaryUuid = localStorage.getItem('apiary_uuid')
  config.headers['X-User-ID'] = apiaryUuid
  return config
})

export const registerUser = async(userId) => {
    const response = await(api.post(`/users/register`))
    return response.data
}

export const getPlots = async() => {
    const response = await api.get(`/plots`)
    return response.data
}

export const newPlot = async(plot) =>{
    const response = await api.post(`/plots/create`,plot)
    return response.data
}

export default api