import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { LoginPayload, RegisterPayload } from '@/api/auth'

export interface User {
  id: number
  name: string
  email: string
  role: string
  is_superadmin?: boolean
  menus?: string[]
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
  const isSuperadmin = computed(() => !!user.value?.is_superadmin)
  const isCoach   = computed(() => user.value?.role === 'coach')
  const school    = computed(() => user.value?.school)

  // Access is locked when the status says so, or the trial end date has already passed
  const isSubscriptionLocked = computed(() => {
    if (user.value?.is_superadmin) return false
    const s = user.value?.school
    if (!s) return false
    if (['expired', 'canceled', 'past_due'].includes(s.subscription_status)) return true
    return s.subscription_status === 'trialing'
      && !!s.trial_ends_at
      && new Date(s.trial_ends_at).getTime() < Date.now()
  })
  const renewalPrompt = ref(false)

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

  // callServer=false when the session is already gone (401), to avoid a request loop
  async function logout(callServer = true) {
    const hadUser = !!user.value
    if (hadUser && callServer) {
      try { await authApi.logout() } catch { /* session may already be invalid */ }
    }
    user.value = null
    renewalPrompt.value = false
    const { default: router } = await import('@/router')
    await router.replace({ name: 'login' })
  }

  return {
    user, isAuthenticated, isAdmin, isTeacher, isCoach, school,
    isSuperadmin, isSubscriptionLocked, renewalPrompt,
    login, register, fetchMe, logout,
  }
})
