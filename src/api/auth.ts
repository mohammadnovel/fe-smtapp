import axios from 'axios'
import http from './http'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  school_name: string
  school_city?: string
  school_province?: string
  school_type: string
  school_email: string
  name: string
  email: string
  password: string
  password_confirmation: string
}

const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000'

export const authApi = {
  csrfCookie: () => axios.get(`${baseURL}/sanctum/csrf-cookie`, { withCredentials: true }),
  login:      (data: LoginPayload)    => http.post('/auth/login', data),
  register:   (data: RegisterPayload) => http.post('/auth/register', data),
  logout:     ()                      => http.post('/auth/logout'),
  me:         ()                      => http.get('/auth/me'),
}
