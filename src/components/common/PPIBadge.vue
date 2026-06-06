<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ ppi: number }>()

const category = computed(() => {
  if (props.ppi >= 90) return { label: 'Excellent',     class: 'badge-excellent' }
  if (props.ppi >= 75) return { label: 'Good',          class: 'badge-good' }
  if (props.ppi >= 60) return { label: 'Average',       class: 'badge-average' }
  if (props.ppi >= 45) return { label: 'Below Average', class: 'badge-below-avg' }
  return                      { label: 'Poor',          class: 'badge-poor' }
})
</script>

<template>
  <span :class="category.class">
    {{ ppi.toFixed(1) }}% — {{ category.label }}
  </span>
</template>
