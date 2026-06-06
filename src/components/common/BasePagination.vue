<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  lastPage: number
  total: number
}>()

const emit = defineEmits<{ (e: 'page', page: number): void }>()

function pages() {
  const range = []
  for (let i = Math.max(1, props.currentPage - 2); i <= Math.min(props.lastPage, props.currentPage + 2); i++) {
    range.push(i)
  }
  return range
}
</script>

<template>
  <div class="flex items-center justify-between px-1 py-3">
    <p class="text-sm text-gray-600">
      Total <span class="font-semibold">{{ total }}</span> data
    </p>
    <div class="flex items-center gap-1">
      <button
        :disabled="currentPage <= 1"
        @click="emit('page', currentPage - 1)"
        class="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-for="p in pages()"
        :key="p"
        @click="emit('page', p)"
        :class="['px-3 py-1 text-sm rounded', p === currentPage ? 'bg-primary-600 text-white' : 'hover:bg-gray-100']"
      >
        {{ p }}
      </button>
      <button
        :disabled="currentPage >= lastPage"
        @click="emit('page', currentPage + 1)"
        class="p-2 rounded hover:bg-gray-100 disabled:opacity-40"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
