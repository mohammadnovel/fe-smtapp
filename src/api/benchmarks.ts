import http from './http'

export const benchmarksApi = {
  list:   ()                          => http.get('/benchmarks'),
  create: (data: object)              => http.post('/benchmarks', data),
  update: (id: number, data: object)  => http.put(`/benchmarks/${id}`, data),
  delete: (id: number)                => http.delete(`/benchmarks/${id}`),
  lookup: (params: object)            => http.get('/benchmarks/lookup', { params }),
}
