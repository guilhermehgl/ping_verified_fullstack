import axios from 'axios'

const devApiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004'

export const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? devApiBaseUrl : '',
  timeout: 10000
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Erro de comunicacao com servidor'
    return Promise.reject(new Error(message))
  }
)
