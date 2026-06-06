<script setup lang="ts">
defineProps<{
  type?: 'info' | 'success' | 'warning' | 'error'
  dismissable?: boolean
}>()

defineEmits<{ (e: 'dismiss'): void }>()
</script>

<template>
  <div :class="[
    'flex items-start gap-3 p-4 rounded-lg text-sm',
    {
      'bg-blue-50 text-blue-800 border border-blue-200':    (!type || type === 'info'),
      'bg-emerald-50 text-emerald-800 border border-emerald-200': type === 'success',
      'bg-amber-50 text-amber-800 border border-amber-200': type === 'warning',
      'bg-red-50 text-red-800 border border-red-200':       type === 'error',
    }
  ]">
    <div class="flex-1"><slot /></div>
    <button v-if="dismissable" @click="$emit('dismiss')" class="opacity-60 hover:opacity-100">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
