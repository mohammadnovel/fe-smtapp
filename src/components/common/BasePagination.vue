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
  <div class="flex items-center gap-1">
    <button :disabled="currentPage <= 1" @click="emit('page', currentPage - 1)" class="act disabled:opacity-40 disabled:cursor-not-allowed">Sebelumnya</button>
    <button
      v-for="p in pages()"
      :key="p"
      @click="emit('page', p)"
      :aria-current="p === currentPage ? 'page' : undefined"
      :class="['act min-w-[2rem] justify-center', p === currentPage ? '!bg-primary-600 !border-primary-600 !text-white' : '']"
    >{{ p }}</button>
    <button :disabled="currentPage >= lastPage" @click="emit('page', currentPage + 1)" class="act disabled:opacity-40 disabled:cursor-not-allowed">Berikutnya</button>
  </div>
</template>
