import { defineStore } from 'pinia'
import { ref } from 'vue'
import { participantsApi, type ParticipantFilters, type ParticipantPayload } from '@/api/participants'

export interface Participant {
  id: string
  school_id: number
  full_name: string
  date_of_birth: string | null
  gender: 'male' | 'female'
  class_name: string | null
  sport_branch: string | null
  is_athlete: boolean
  weight_kg: number | null
  height_cm: number | null
  hr_max: number | null
  photo_url: string | null
  age?: number
  bmi?: number
}

export const useParticipantsStore = defineStore('participants', () => {
  const participants = ref<Participant[]>([])
  const pagination   = ref({ current_page: 1, last_page: 1, total: 0 })
  const loading      = ref(false)
  const classes      = ref<string[]>([])

  async function fetchParticipants(filters: ParticipantFilters = {}) {
    loading.value = true
    try {
      const { data } = await participantsApi.list(filters)
      participants.value = data.data
      pagination.value   = {
        current_page: data.current_page,
        last_page:    data.last_page,
        total:        data.total,
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchClasses() {
    const { data } = await participantsApi.classes()
    classes.value = data
  }

  async function createParticipant(payload: ParticipantPayload) {
    const { data } = await participantsApi.create(payload)
    participants.value.unshift(data)
    return data
  }

  async function updateParticipant(id: string, payload: ParticipantPayload) {
    const { data } = await participantsApi.update(id, payload)
    const idx = participants.value.findIndex(p => p.id === id)
    if (idx !== -1) participants.value[idx] = data
    return data
  }

  async function deleteParticipant(id: string) {
    await participantsApi.delete(id)
    participants.value = participants.value.filter(p => p.id !== id)
  }

  return {
    participants, pagination, loading, classes,
    fetchParticipants, fetchClasses, createParticipant, updateParticipant, deleteParticipant,
  }
})
