<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AlertBanner from '@/components/common/AlertBanner.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const auth   = useAuthStore()
const school = computed(() => auth.school)

const plans = [
  {
    id: 'starter', name: 'Starter', monthly: 99000, yearly: 950000,
    features: ['≤ 100 peserta', '3 pengguna', 'Tes inti + laporan dasar'],
    color: 'border-gray-200',
  },
  {
    id: 'growth', name: 'Growth', monthly: 249000, yearly: 2390000,
    features: ['≤ 500 peserta', '10 pengguna', 'Notifikasi + benchmark kustom'],
    color: 'border-primary-400',
    popular: true,
  },
  {
    id: 'pro', name: 'Pro', monthly: 499000, yearly: 4790000,
    features: ['Peserta tidak terbatas', 'Pengguna tidak terbatas', 'Sport science + laporan tahunan'],
    color: 'border-gray-200',
  },
]

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
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Langganan & Billing</h1>
      <p class="text-sm text-gray-500">Kelola paket dan pembayaran sekolah</p>
    </div>

    <!-- Current status -->
    <div v-if="school" class="card">
      <h2 class="font-semibold text-gray-900 mb-3">Status Langganan</h2>
      <div class="flex flex-wrap gap-6">
        <div>
          <p class="text-xs text-gray-500">Paket Aktif</p>
          <p class="font-semibold text-gray-900 capitalize">{{ school.subscription_plan }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500">Status</p>
          <span :class="statusColor(school.subscription_status)">{{ school.subscription_status }}</span>
        </div>
        <div v-if="school.trial_ends_at">
          <p class="text-xs text-gray-500">Trial Berakhir</p>
          <p class="font-semibold text-gray-900">{{ school.trial_ends_at.split('T')[0] }}</p>
        </div>
        <div v-if="school.renewal_date">
          <p class="text-xs text-gray-500">Tanggal Perpanjangan</p>
          <p class="font-semibold text-gray-900">{{ school.renewal_date }}</p>
        </div>
      </div>
    </div>

    <!-- Plan selection -->
    <div>
      <h2 class="font-semibold text-gray-900 mb-4">Pilih Paket</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="plan in plans"
          :key="plan.id"
          :class="['rounded-xl border-2 p-5 relative', plan.color, plan.popular ? 'shadow-lg' : '']"
        >
          <div v-if="plan.popular" class="absolute -top-3 left-1/2 -translate-x-1/2">
            <span class="badge-good text-xs px-3 py-1">Paling Populer</span>
          </div>
          <h3 class="font-bold text-xl text-gray-900">{{ plan.name }}</h3>
          <div class="mt-2 mb-4">
            <p class="text-2xl font-bold text-primary-600">{{ formatPrice(plan.monthly) }}<span class="text-sm font-normal text-gray-500">/bulan</span></p>
            <p class="text-sm text-gray-500">atau {{ formatPrice(plan.yearly) }}/tahun</p>
          </div>
          <ul class="space-y-1.5 mb-5">
            <li v-for="f in plan.features" :key="f" class="flex items-center gap-2 text-sm text-gray-700">
              <svg class="h-4 w-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ f }}
            </li>
          </ul>
          <BaseButton :variant="plan.popular ? 'primary' : 'secondary'" class="w-full">
            Pilih {{ plan.name }}
          </BaseButton>
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-3">Pembayaran melalui Midtrans (Transfer Bank, QRIS, Kartu Kredit). Integrasi Midtrans diperlukan.</p>
    </div>
  </div>
</template>
