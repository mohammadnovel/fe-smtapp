import http from './http'

export interface ParticipantFilters {
  search?: string
  class_name?: string
  gender?: 'male' | 'female'
  is_athlete?: boolean
  sport_branch?: string
  page?: number
  per_page?: number
}

export interface ParticipantPayload {
  full_name: string
  date_of_birth?: string
  gender: 'male' | 'female'
  class_name?: string
  sport_branch?: string
  is_athlete: boolean
  weight_kg?: number
  height_cm?: number
  photo_url?: string
}

export const participantsApi = {
  list:    (filters: ParticipantFilters = {}) => http.get('/participants', { params: filters }),
  get:     (id: number)                       => http.get(`/participants/${id}`),
  create:  (data: ParticipantPayload)         => http.post('/participants', data),
  update:  (id: number, data: ParticipantPayload) => http.put(`/participants/${id}`, data),
  delete:  (id: number)                       => http.delete(`/participants/${id}`),
  classes: ()                                 => http.get('/participants/classes'),
}
