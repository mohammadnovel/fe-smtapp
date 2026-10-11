import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sessionsApi } from '@/api/sessions'

export interface TestSession {
  id: string
  participant_id: string
  academic_year: string
  semester: 1 | 2
  test_date: string
  location: string | null
  status: 'draft' | 'final'
  participant?: { id: string; full_name: string; gender: string; is_athlete: boolean }
  test_results?: TestResult[]
  aerobic_laps?: AerobicLap[]
  anaerobic_sprints?: AnaerobicSprint[]
}

export interface TestResult {
  id: string
  session_id: string
  component: string
  test_item: string
  result_value: number | null
  unit: string | null
  benchmark_value: number | null
  percentage: number | null
  is_strength: boolean
  is_weakness: boolean
  lower_is_better: boolean
}

export interface AerobicLap {
  lap_number: number
  time_cumulative: number
  time_per_lap: number | null
  distance_meter: number
  speed_mps: number | null
}

export interface AnaerobicSprint {
  sprint_number: number
  time_seconds: number
  speed_mps: number | null
  power_watt: number | null
}

export const useSessionsStore = defineStore('sessions', () => {
  const sessions   = ref<TestSession[]>([])
  const current    = ref<TestSession | null>(null)
  const pagination = ref({ current_page: 1, last_page: 1, total: 0 })
  const loading    = ref(false)

  async function fetchSessions(params = {}) {
    loading.value = true
    try {
      const { data } = await sessionsApi.list(params)
      sessions.value   = data.data
      pagination.value = {
        current_page: data.current_page,
        last_page:    data.last_page,
        total:        data.total,
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchSession(id: string) {
    const { data } = await sessionsApi.get(id)
    current.value = data
    return data
  }

  async function createSession(payload: object) {
    const { data } = await sessionsApi.create(payload)
    sessions.value.unshift(data)
    return data
  }

  async function finalizeSession(id: string) {
    const { data } = await sessionsApi.finalize(id)
    if (current.value?.id === id) current.value = data
    return data
  }

  async function deleteSession(id: string) {
    await sessionsApi.delete(id)
    sessions.value = sessions.value.filter(s => s.id !== id)
  }

  return {
    sessions, current, pagination, loading,
    fetchSessions, fetchSession, createSession, finalizeSession, deleteSession,
  }
})
