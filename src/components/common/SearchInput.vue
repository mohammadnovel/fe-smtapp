<script setup lang="ts">
defineProps<{ modelValue: string; placeholder?: string }>()
defineEmits<{ (e: 'update:modelValue', v: string): void }>()
</script>

<template>
  <div class="relative w-full sm:w-auto">
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
    </svg>
    <input
      :value="modelValue"
      type="search"
      :placeholder="placeholder ?? 'Cari…'"
      :aria-label="placeholder ?? 'Cari'"
      class="field-search"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
