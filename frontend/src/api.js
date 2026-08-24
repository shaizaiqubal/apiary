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

export const registerUser = async() => {
    const response = await api.post(`/users/register`)
    return response.data
}

export const getPlots = async() => {
    const response = await api.get(`/plots`)
    return response.data
}

export const getPlot = async(plotId) => {
    const response = await api.get(`/plots/${plotId}`)
    return response.data
}

export const newPlot = async(plot) => {
    const response = await api.post(`/plots/create`,plot)
    return response.data
}

export const getBeedex = async() => {
    const response = await api.get(`/beedex`)
    return response.data
}
export const getUserBeedex = async() => {
    const response = await api.get(`/beedex/user`)
    return response.data
}

export const getQuest = async(plotId) => {
    const response = await api.get(`/quests/plot/${plotId}`)
    return response.data
}

export const logQuest = async (formData) => {
  const response = await api.post('/quests', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const logSighting = async(formData) => {
    const response = await api.post('/sightings',formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}

export const confirmSighting = async (sightingId, speciesId) => {
    const response = await api.post(`/sightings/${sightingId}/confirm`, null, {
        params: { species_id: speciesId }
    })
    return response.data
}

export const getMap = async() => {
    const response = await api.get(`/plots/map/all`)
    return response.data
}

export default api