<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import http from '@/api/http'

defineEmits<{ (e: 'toggle-sidebar'): void }>()

const unreadCount = ref(0)

async function fetchUnread() {
  try {
    const { data } = await http.get('/notifications/unread-count')
    unreadCount.value = data.count
  } catch { /* ignore */ }
}

onMounted(fetchUnread)
</script>

<template>
  <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
    <button
      @click="$emit('toggle-sidebar')"
      class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <div class="flex items-center gap-3 ml-auto">
      <RouterLink to="/notifications" class="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span v-if="unreadCount > 0" class="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </RouterLink>
    </div>
  </header>
</template>
