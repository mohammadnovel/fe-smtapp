<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps<{
  school: {
    subscription_status: string
    trial_ends_at: string | null
    renewal_date: string | null
  }
}>()

const banner = computed(() => {
  const s = props.school.subscription_status
  if (s === 'trialing' && props.school.trial_ends_at) {
    const days = Math.ceil((new Date(props.school.trial_ends_at).getTime() - Date.now()) / 86400000)
    if (days <= 2) {
      return { type: 'warning', msg: `Trial berakhir dalam ${days} hari. Pilih paket sekarang.` }
    }
  }
  if (s === 'past_due') return { type: 'error',   msg: 'Langganan jatuh tempo. Akses tulis dikunci.' }
  if (s === 'expired')  return { type: 'error',   msg: 'Langganan berakhir. Mode baca saja aktif.' }
  if (s === 'canceled') return { type: 'warning', msg: 'Langganan dibatalkan. Mode baca saja aktif.' }
  return null
})
</script>

<template>
  <div v-if="banner" :class="[
    'flex items-center justify-between px-6 py-2 text-sm',
    banner.type === 'error'   ? 'bg-red-50 text-red-800 border-b border-red-200' : '',
    banner.type === 'warning' ? 'bg-amber-50 text-amber-800 border-b border-amber-200' : '',
  ]">
    <span>{{ banner.msg }}</span>
    <RouterLink to="/billing" class="underline font-medium ml-3">Kelola Langganan</RouterLink>
  </div>
</template>
