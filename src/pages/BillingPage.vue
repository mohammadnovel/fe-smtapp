<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import http from '@/api/http'
import { useAuthStore } from '@/stores/auth'
import PageHeader from '@/components/common/PageHeader.vue'

const auth   = useAuthStore()
const school = computed(() => auth.school)

interface Plan {
  code: string; name: string; price_monthly: number; price_yearly: number
  features: string[]; is_popular: boolean
}
const plans = ref<Plan[]>([])
onMounted(async () => {
  const { data } = await http.get('/plans')
  plans.value = data
})

function formatPrice(n: number) {
  return `IDR ${n.toLocaleString('id-ID')}`
}

function statusColor(s: string) {
  return {
    trialing: 'badge-average',
    active:   'badge-excellent',
    past_due: 'badge-below-avg',
    expired:  'badge-poor',
    canceled: 'badge-poor',
  }[s] ?? 'badge-average'
}
</script>

<template>
  <div class="space-y-8">
    <PageHeader title="Langganan" subtitle="Kelola paket dan pembayaran sekolah" />

    <section v-if="school" class="card">
      <h2 class="text-lg font-semibold text-gray-900">Status saat ini</h2>
      <dl class="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <dt class="text-sm text-gray-500">Paket aktif</dt>
          <dd class="mt-1 font-semibold text-gray-900 capitalize">{{ school.subscription_plan }}</dd>
        </div>
        <div>
          <dt class="text-sm text-gray-500">Status</dt>
          <dd class="mt-1"><span :class="statusColor(school.subscription_status)">{{ school.subscription_status }}</span></dd>
        </div>
        <div v-if="school.trial_ends_at">
          <dt class="text-sm text-gray-500">Trial berakhir</dt>
          <dd class="mt-1 font-semibold text-gray-900">{{ school.trial_ends_at.split('T')[0] }}</dd>
        </div>
        <div v-if="school.renewal_date">
          <dt class="text-sm text-gray-500">Perpanjangan</dt>
          <dd class="mt-1 font-semibold text-gray-900">{{ school.renewal_date }}</dd>
        </div>
      </dl>
    </section>

    <section>
      <h2 class="text-lg font-semibold text-gray-900">Pilih paket</h2>
      <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          v-for="plan in plans"
          :key="plan.code"
          :class="['flex flex-col rounded-lg p-6', plan.is_popular ? 'bg-primary-900 text-white' : 'bg-white border border-gray-200']"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold">{{ plan.name }}</h3>
            <span v-if="plan.is_popular" class="text-xs font-semibold text-emerald-300">Paling banyak dipilih</span>
          </div>
          <p class="mt-4 text-3xl font-extrabold">{{ formatPrice(plan.price_monthly) }}<span :class="['text-sm font-normal', plan.is_popular ? 'text-emerald-100/70' : 'text-gray-500']"> /bulan</span></p>
          <p :class="['mt-1 text-sm', plan.is_popular ? 'text-emerald-100/70' : 'text-gray-500']">atau {{ formatPrice(plan.price_yearly) }} /tahun</p>
          <ul class="mt-5 space-y-2 flex-1">
            <li v-for="f in plan.features" :key="f" :class="['text-sm', plan.is_popular ? 'text-emerald-50/90' : 'text-gray-700']">{{ f }}</li>
          </ul>
          <button disabled
            :class="['mt-6 rounded-md px-4 py-2.5 text-sm font-semibold cursor-not-allowed', plan.is_popular ? 'bg-white/15 text-white/70' : 'bg-gray-100 text-gray-400']">
            Pembayaran online segera hadir
          </button>
        </div>
      </div>
      <p class="mt-4 text-sm text-gray-500">
        Untuk memperpanjang sekarang, hubungi tim kami. Pembayaran lewat Midtrans (transfer bank, QRIS, kartu kredit) belum diaktifkan.
      </p>
    </section>
  </div>
</template>
