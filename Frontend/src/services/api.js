import axios from 'axios'

const devApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || devApiBaseUrl
})
