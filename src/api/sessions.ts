import http from './http'

export const sessionsApi = {
  list:    (params = {})             => http.get('/test-sessions', { params }),
  get:     (id: string)              => http.get(`/test-sessions/${id}`),
  create:  (data: object)            => http.post('/test-sessions', data),
  update:  (id: string, data: object)=> http.put(`/test-sessions/${id}`, data),
  delete:  (id: string)              => http.delete(`/test-sessions/${id}`),
  finalize:(id: string)              => http.post(`/test-sessions/${id}/finalize`),

  saveResults:  (id: string, data: object) => http.post(`/test-sessions/${id}/results`, data),
  getPPI:       (id: string)               => http.get(`/test-sessions/${id}/ppi`),

  saveAerobicLaps:    (id: string, data: object) => http.post(`/test-sessions/${id}/aerobic-laps`, data),
  getAerobicLaps:     (id: string)               => http.get(`/test-sessions/${id}/aerobic-laps`),
  getAerobicResults:  (id: string)               => http.get(`/test-sessions/${id}/aerobic-results`),

  saveAnaerobicSprints:  (id: string, data: object) => http.post(`/test-sessions/${id}/anaerobic-sprints`, data),
  getAnaerobicSprints:   (id: string)               => http.get(`/test-sessions/${id}/anaerobic-sprints`),
  getAnaerobicResults:   (id: string)               => http.get(`/test-sessions/${id}/anaerobic-results`),
}
