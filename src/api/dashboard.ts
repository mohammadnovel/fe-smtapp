import http from './http'

export const dashboardApi = {
  index:              ()            => http.get('/dashboard'),
  participantProgress:(id: number)  => http.get(`/dashboard/participant/${id}/progress`),
}
