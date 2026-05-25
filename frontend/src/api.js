import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

export const getLogs = () => api.get('/logs/').then(r => r.data)
export const getToday = () => api.get('/logs/today').then(r => r.data)
export const getStats = () => api.get('/stats/').then(r => r.data)
export const postLog = (data) => api.post('/logs/', data).then(r => r.data)

export const getFitnessLogs = () => api.get('/fitness/').then(r => r.data)
export const getFitnessToday = () => api.get('/fitness/today').then(r => r.data)   
export const postFitness = (data) => api.post('/fitness/', data).then(r => r.data)