<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

const icons: Record<string, string> = {
  success: 'M5 13l4 4L19 7',
  error:   'M6 18L18 6M6 6l12 12',
  warning: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  info:    'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const colors: Record<string, string> = {
  success: 'bg-emerald-50 border-emerald-300 text-emerald-800',
  error:   'bg-red-50 border-red-300 text-red-800',
  warning: 'bg-amber-50 border-amber-300 text-amber-800',
  info:    'bg-blue-50 border-blue-300 text-blue-800',
}

const iconColors: Record<string, string> = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-blue-500',
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none" style="min-width:280px; max-width:380px;">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm', colors[t.type]]"
        >
          <svg :class="['h-5 w-5 flex-shrink-0 mt-0.5', iconColors[t.type]]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" :d="icons[t.type]" />
          </svg>
          <p class="flex-1 leading-snug">{{ t.message }}</p>
          <button @click="dismiss(t.id)" class="opacity-50 hover:opacity-100 flex-shrink-0 mt-0.5">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active { transition: all 0.25s ease; }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(32px); }
.toast-leave-to     { opacity: 0; transform: translateX(32px); }
</style>
