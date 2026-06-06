<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'btn-primary focus:ring-primary-500':        (!variant || variant === 'primary'),
        'btn-secondary focus:ring-primary-500':      variant === 'secondary',
        'btn-danger focus:ring-red-500':             variant === 'danger',
        'text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 text-sm rounded-md focus:ring-gray-500': variant === 'ghost',
        'px-3 py-1.5 text-xs': size === 'sm',
        'px-4 py-2 text-sm':   (!size || size === 'md'),
        'px-6 py-3 text-base': size === 'lg',
      }
    ]"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>
