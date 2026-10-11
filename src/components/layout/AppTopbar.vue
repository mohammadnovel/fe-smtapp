<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import http from '@/api/http'
import { useAuthStore } from '@/stores/auth'

defineEmits<{ (e: 'toggle-sidebar'): void }>()

const auth = useAuthStore()
const unreadCount = ref(0)

async function fetchUnread() {
  try {
    const { data } = await http.get('/notifications/unread-count')
    unreadCount.value = data.count
  } catch { /* ignore */ }
}

onMounted(fetchUnread)

// Plan status shown next to the page so the trial deadline is always visible
const plan = computed(() => {
  const s = auth.school
  if (!s || auth.user?.is_superadmin) return null
  if (s.subscription_status === 'trialing' && s.trial_ends_at) {
    const days = Math.ceil((new Date(s.trial_ends_at).getTime() - Date.now()) / 86400000)
    return days > 0
      ? { text: `Trial, sisa ${days} hari`, tone: days <= 2 ? 'warn' : 'info' }
      : { text: 'Trial berakhir', tone: 'bad' }
  }
  if (['expired', 'canceled', 'past_due'].includes(s.subscription_status)) return { text: 'Langganan tidak aktif', tone: 'bad' }
  return { text: `Paket ${s.subscription_plan}`, tone: 'info' }
})

const tones: Record<string, string> = {
  info: 'bg-gray-100 text-gray-700',
  warn: 'bg-amber-100 text-amber-800',
  bad:  'bg-red-100 text-red-800',
}
</script>

<template>
  <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
    <div class="flex items-center gap-3">
      <button @click="$emit('toggle-sidebar')" class="lg:hidden p-2 -ml-2 rounded-md text-gray-600 hover:bg-gray-100" aria-label="Buka menu">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <RouterLink v-if="plan && auth.isAdmin" to="/billing" :class="['rounded-md px-2.5 py-1 text-xs font-semibold capitalize', tones[plan.tone]]">{{ plan.text }}</RouterLink>
      <span v-else-if="plan" :class="['rounded-md px-2.5 py-1 text-xs font-semibold capitalize', tones[plan.tone]]">{{ plan.text }}</span>
    </div>

    <RouterLink to="/notifications" class="relative p-2 rounded-md text-gray-600 hover:bg-gray-100" aria-label="Notifikasi">
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span v-if="unreadCount > 0" class="absolute top-0.5 right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </RouterLink>
  </header>
</template>
