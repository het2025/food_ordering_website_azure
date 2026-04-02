import axios from 'axios'

// Resolve the backend base URL.
// Dev  : VITE_API_BASE_URL=/api  → Vite proxy forwards /api/* to localhost:5000
// Prod : VITE_API_BASE_URL=https://customer-backend-ibwg.onrender.com (with OR without /api)
//        We always ensure the URL ends with /api so every fetch/AxiosInstance call is correct.
const _raw = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const API_BASE_URL = _raw
  ? (_raw.endsWith('/api') ? _raw : _raw + '/api')
  : '/api';


// Create axios instance for API calls
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // withCredentials: true, // uncomment if backend uses cookies
})

// Request interceptor
axiosInstance.interceptors.request.use(
  config => {
    // You can add authorization token here if needed
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Handle global errors here
    return Promise.reject(error)
  }
)

export default axiosInstance
