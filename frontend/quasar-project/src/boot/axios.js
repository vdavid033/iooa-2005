import { boot } from 'quasar/wrappers'
import axios from 'axios'

// API instance for local server
const api = axios.create({ 
  baseURL: 'http://localhost:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default boot(({ app }) => {
  // For Options API
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

// REQUEST INTERCEPTOR - automatically adds token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error)
  }
)

// RESPONSE INTERCEPTOR - handle common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Log only important errors
    if (error.response?.status === 401) {
      console.warn('401 Unauthorized - token možda je istekao');
    } else if (error.response?.status === 403) {
      console.warn('403 Forbidden - nema dozvolu za akciju');
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response?.status, error.response?.data);
    }
    
    return Promise.reject(error)
  }
)

export { api }