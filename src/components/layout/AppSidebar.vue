<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps<{ open: boolean }>()
defineEmits<{ (e: 'close'): void }>()

const route   = useRoute()
const auth    = useAuthStore()
const appName = import.meta.env.VITE_APP_NAME ?? 'SM ATAPP'

interface NavItem { code: string; name: string; to: string; icon: string }

const allItems: NavItem[] = [
  { code: 'dashboard',     name: 'Dashboard',     to: '/dashboard',     icon: 'home' },
  { code: 'participants',  name: 'Peserta',       to: '/participants',  icon: 'users' },
  { code: 'sessions',      name: 'Tes Kebugaran', to: '/sessions',      icon: 'clipboard' },
  { code: 'benchmarks',    name: 'Benchmark',     to: '/benchmarks',    icon: 'chart' },
  { code: 'notifications', name: 'Notifikasi',    to: '/notifications', icon: 'bell' },
  { code: 'users',         name: 'Pengguna',      to: '/users',         icon: 'user-group' },
  { code: 'billing',       name: 'Langganan',     to: '/billing',       icon: 'credit-card' },
]

// Menus follow the role's access from Master Data, grouped by purpose
const groups = computed(() => {
  const allowed = auth.user?.menus
  const visible = allItems.filter(i => !allowed || allowed.includes(i.code))
  const result = [
    { title: 'Utama',      items: visible.filter(i => !['users', 'billing'].includes(i.code)) },
    { title: 'Sekolah',    items: visible.filter(i => ['users', 'billing'].includes(i.code)) },
  ]
  if (auth.isSuperadmin) {
    result.push({ title: 'Super Admin', items: [{ code: 'master', name: 'Master Data', to: '/master', icon: 'database' }] })
  }
  return result.filter(g => g.items.length)
})

const isActive = (to: string) => route.path.startsWith(to)

const icons: Record<string, string> = {
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  users: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  'user-group': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  'credit-card': 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  database: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
}

const roleLabel = computed(() => auth.user?.is_superadmin ? 'Super Admin' : auth.user?.role)
</script>

<template>
  <!-- Backdrop (mobile) -->
  <Transition enter-active-class="duration-200" leave-active-class="duration-150"
    enter-from-class="opacity-0" enter-to-class="opacity-100"
    leave-from-class="opacity-100" leave-to-class="opacity-0">
    <div v-if="open" class="fixed inset-0 bg-black/40 z-20 lg:hidden" @click="$emit('close')" />
  </Transition>

  <aside :class="[
    'fixed inset-y-0 left-0 z-30 w-64 bg-primary-900 text-emerald-50 flex flex-col',
    'transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
    open ? 'translate-x-0' : '-translate-x-full'
  ]">
    <!-- Brand -->
    <div class="flex items-center gap-3 px-5 h-16 border-b border-white/10 flex-shrink-0">
      <span class="h-8 w-8 rounded-md bg-primary-500 flex items-center justify-center font-black text-xs text-primary-900">SA</span>
      <div class="min-w-0">
        <p class="font-bold text-white text-sm leading-tight">{{ appName }}</p>
        <p class="text-xs text-emerald-100/70 truncate">{{ auth.school?.name }}</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-5 space-y-6 overflow-y-auto" aria-label="Menu utama">
      <div v-for="g in groups" :key="g.title">
        <p class="px-3 mb-2 text-xs font-medium text-emerald-100/60">{{ g.title }}</p>
        <div class="space-y-0.5">
          <RouterLink
            v-for="item in g.items"
            :key="item.to"
            :to="item.to"
            @click="$emit('close')"
            :aria-current="isActive(item.to) ? 'page' : undefined"
            :class="[
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive(item.to)
                ? 'bg-white/95 text-primary-900'
                : 'text-emerald-50/80 hover:bg-white/10 hover:text-white'
            ]"
          >
            <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="icons[item.icon]" />
            </svg>
            {{ item.name }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Account -->
    <div class="p-3 border-t border-white/10 flex-shrink-0">
      <div class="flex items-center gap-3 px-2 py-2">
        <div class="h-9 w-9 rounded-full bg-emerald-200 text-primary-900 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {{ auth.user?.name?.charAt(0)?.toUpperCase() }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-white truncate">{{ auth.user?.name }}</p>
          <p class="text-xs text-emerald-100/70 capitalize">{{ roleLabel }}</p>
        </div>
      </div>
      <button @click="auth.logout()"
        class="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-emerald-50/80 hover:bg-white/10 hover:text-white transition-colors">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Keluar
      </button>
    </div>
  </aside>
</template>
