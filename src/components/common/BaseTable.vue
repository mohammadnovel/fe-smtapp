<script setup lang="ts">
defineProps<{
  headers: { key: string; label: string; class?: string }[]
  loading?: boolean
  emptyMessage?: string
}>()
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-gray-200">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th
            v-for="h in headers"
            :key="h.key"
            :class="['px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider', h.class]"
          >
            {{ h.label }}
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-100">
        <tr v-if="loading">
          <td :colspan="headers.length" class="px-4 py-12 text-center">
            <div class="flex justify-center">
              <svg class="animate-spin h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </td>
        </tr>
        <slot v-else />
        <tr v-if="!loading && $slots.empty === undefined">
          <td :colspan="headers.length">
            <slot name="empty">
              <div class="text-center py-12 text-gray-400 text-sm">
                {{ emptyMessage ?? 'Tidak ada data.' }}
              </div>
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
