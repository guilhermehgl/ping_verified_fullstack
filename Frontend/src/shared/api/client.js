import axios from 'axios'
import { isDemo } from './mode'
import { createDemoApi } from './demo'

function createLocalClient() {
  const url = new URL(import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000')
  if (url.protocol !== 'http:' || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('Modo local requer API HTTP no próprio computador.')
  }
  const client = axios.create({ baseURL: url.href, timeout: 10000 })
  client.interceptors.response.use(response => response, error =>
    Promise.reject(new Error(error.response?.data?.error || 'Erro de comunicação com servidor')))
  return client
}

export const apiClient = isDemo ? createDemoApi() : createLocalClient()
