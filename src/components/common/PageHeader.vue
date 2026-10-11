<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div class="min-w-0">
      <h1 class="text-2xl font-bold tracking-tight text-gray-900">{{ title }}</h1>
      <p v-if="subtitle || $slots.subtitle" class="mt-1 text-sm text-gray-500">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>
    <div v-if="$slots.default" class="flex flex-wrap items-center gap-2">
      <slot />
    </div>
  </div>
</template>
