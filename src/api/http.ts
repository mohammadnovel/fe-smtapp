import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      if (auth.user) {
        auth.logout(false)
      }
    }
    if (error.response?.status === 403 && error.response.data?.status) {
      useAuthStore().renewalPrompt = true
    }
    return Promise.reject(error)
  }
)

export default http
