import http from './http'

export const sessionsApi = {
  list:    (params = {})             => http.get('/test-sessions', { params }),
  get:     (id: number)              => http.get(`/test-sessions/${id}`),
  create:  (data: object)            => http.post('/test-sessions', data),
  update:  (id: number, data: object)=> http.put(`/test-sessions/${id}`, data),
  delete:  (id: number)              => http.delete(`/test-sessions/${id}`),
  finalize:(id: number)              => http.post(`/test-sessions/${id}/finalize`),

  saveResults:  (id: number, data: object) => http.post(`/test-sessions/${id}/results`, data),
  getPPI:       (id: number)               => http.get(`/test-sessions/${id}/ppi`),

  saveAerobicLaps:    (id: number, data: object) => http.post(`/test-sessions/${id}/aerobic-laps`, data),
  getAerobicLaps:     (id: number)               => http.get(`/test-sessions/${id}/aerobic-laps`),
  getAerobicResults:  (id: number)               => http.get(`/test-sessions/${id}/aerobic-results`),

  saveAnaerobicSprints:  (id: number, data: object) => http.post(`/test-sessions/${id}/anaerobic-sprints`, data),
  getAnaerobicSprints:   (id: number)               => http.get(`/test-sessions/${id}/anaerobic-sprints`),
  getAnaerobicResults:   (id: number)               => http.get(`/test-sessions/${id}/anaerobic-results`),
}
