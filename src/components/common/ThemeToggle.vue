<script setup lang="ts">
import { useTheme, type ThemeMode } from '@/composables/useTheme'

defineProps<{ onDark?: boolean }>()

const { mode, setMode } = useTheme()

const options: { value: ThemeMode; label: string; path: string }[] = [
  { value: 'light',  label: 'Terang', path: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' },
  { value: 'system', label: 'Ikuti sistem', path: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { value: 'dark',   label: 'Gelap', path: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z' },
]
</script>

<template>
  <div
    :class="['inline-flex rounded-md p-0.5', onDark ? 'bg-white/10' : 'bg-gray-100']"
    role="group"
    aria-label="Tema tampilan"
  >
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      :title="o.label"
      :aria-label="o.label"
      :aria-pressed="mode === o.value"
      :class="[
        'rounded p-1.5 transition-colors',
        mode === o.value
          ? (onDark ? 'bg-white/95 text-primary-900' : 'theme-on')
          : (onDark ? 'text-emerald-100/80 hover:text-white' : 'text-gray-500 hover:text-gray-900'),
      ]"
      @click="setMode(o.value)"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" :d="o.path" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.theme-on { background-color: rgb(var(--surface)); color: rgb(var(--g-900)); box-shadow: 0 1px 2px rgb(0 0 0 / 0.08); }
.dark .theme-on { background-color: rgb(var(--raised)); }
</style>
