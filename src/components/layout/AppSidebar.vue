<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps<{ open: boolean }>()
defineEmits<{ (e: 'close'): void }>()

const route   = useRoute()
const auth    = useAuthStore()
const appName = import.meta.env.VITE_APP_NAME ?? 'SM ATAPP'

const navItems = computed(() => {
  const items = [
    { name: 'Dashboard',     to: '/',              icon: 'home' },
    { name: 'Peserta',       to: '/participants',  icon: 'users' },
    { name: 'Tes Kebugaran', to: '/sessions',      icon: 'clipboard' },
    { name: 'Benchmark',     to: '/benchmarks',    icon: 'chart' },
    { name: 'Notifikasi',    to: '/notifications', icon: 'bell' },
  ]
  if (auth.isAdmin) {
    items.push(
      { name: 'Pengguna',  to: '/users',   icon: 'user-group' },
      { name: 'Langganan', to: '/billing', icon: 'credit-card' }
    )
  }
  return items
})
</script>

<template>
  <!-- Backdrop (mobile) -->
  <Transition enter-active-class="duration-200" leave-active-class="duration-150"
    enter-from-class="opacity-0" enter-to-class="opacity-100"
    leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="open" class="fixed inset-0 bg-black/30 z-20 lg:hidden" @click="$emit('close')" />
  </Transition>

  <!-- Sidebar -->
  <aside :class="[
    'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col',
    'transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
    open ? 'translate-x-0' : '-translate-x-full'
  ]">
    <!-- Logo -->
    <div class="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
      <div class="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
        <span class="text-white font-bold text-sm">SA</span>
      </div>
      <div>
        <p class="font-bold text-gray-900 text-sm leading-tight">{{ appName }}</p>
        <p class="text-xs text-gray-500 truncate max-w-[140px]">{{ auth.school?.name }}</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        @click="$emit('close')"
        :class="[
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to))
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        ]"
      >
        <!-- Icons -->
        <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="item.icon === 'home'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          <path v-else-if="item.icon === 'users'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          <path v-else-if="item.icon === 'clipboard'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          <path v-else-if="item.icon === 'chart'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          <path v-else-if="item.icon === 'bell'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          <path v-else-if="item.icon === 'user-group'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          <path v-else-if="item.icon === 'credit-card'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        {{ item.name }}
      </RouterLink>
    </nav>

    <!-- User info -->
    <div class="px-4 py-4 border-t border-gray-100">
      <div class="flex items-center gap-3">
        <div class="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
          {{ auth.user?.name?.charAt(0)?.toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ auth.user?.name }}</p>
          <p class="text-xs text-gray-500 capitalize">{{ auth.user?.role }}</p>
        </div>
        <button @click="auth.logout()" class="text-gray-400 hover:text-red-500 transition-colors" title="Keluar">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>
