import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { LoginPayload, RegisterPayload } from '@/api/auth'

export interface User {
  id: number
  name: string
  email: string
  role: 'administrator' | 'teacher' | 'coach'
  school_id: number
  school: {
    id: number
    name: string
    subscription_status: string
    subscription_plan: string
    trial_ends_at: string | null
    renewal_date: string | null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin   = computed(() => user.value?.role === 'administrator')
  const isTeacher = computed(() => user.value?.role === 'teacher')
  const isCoach   = computed(() => user.value?.role === 'coach')
  const school    = computed(() => user.value?.school)

  async function login(credentials: LoginPayload) {
    await authApi.csrfCookie()
    const { data } = await authApi.login(credentials)
    user.value = data.user
    return data
  }

  async function register(payload: RegisterPayload) {
    await authApi.csrfCookie()
    const { data } = await authApi.register(payload)
    user.value = data.user
    return data
  }

  async function fetchMe() {
    try {
      const { data } = await authApi.me()
      user.value = data
    } catch {
      user.value = null
    }
  }

  function logout() {
    const hadUser = !!user.value
    user.value = null
    if (hadUser) {
      authApi.logout().catch(() => { /* ignore */ })
    }
  }

  return {
    user, isAuthenticated, isAdmin, isTeacher, isCoach, school,
    login, register, fetchMe, logout,
  }
})
