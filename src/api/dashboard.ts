import http from './http'

export const dashboardApi = {
  index:              ()            => http.get('/dashboard'),
  participantProgress:(id: string)  => http.get(`/dashboard/participant/${id}/progress`),
}
