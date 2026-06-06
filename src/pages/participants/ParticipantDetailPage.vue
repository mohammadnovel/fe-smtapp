<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { participantsApi } from '@/api/participants'
import { dashboardApi } from '@/api/dashboard'
import PPIBadge from '@/components/common/PPIBadge.vue'
import { Radar, Line } from 'vue-chartjs'
import { formatDate, formatDateTime } from '@/utils/date'

const route       = useRoute()
const participant = ref<any>(null)
const progress    = ref<any[]>([])
const loading     = ref(true)
const errorMsg    = ref('')

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    const [pRes, progRes] = await Promise.all([
      participantsApi.get(id),
      dashboardApi.participantProgress(id),
    ])
    participant.value = pRes.data
    progress.value    = progRes.data
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message ?? 'Gagal memuat data peserta.'
  } finally {
    loading.value = false
  }
})

const radarData = computed(() => {
  if (!progress.value.length) return null
  const latest = progress.value[progress.value.length - 1]
  const labels  = Object.keys(latest.components ?? {})
  const values  = Object.values(latest.components ?? {})
  return {
    labels,
    datasets: [{
      label: 'Persentase vs Benchmark',
      data: values,
      backgroundColor: 'rgba(16,185,129,0.15)',
      borderColor: '#10b981',
      pointBackgroundColor: '#10b981',
    }]
  }
})

const lineData = computed(() => {
  if (progress.value.length < 2) return null
  return {
    labels: progress.value.map(p => `${p.academic_year} Sem ${p.semester}`),
    datasets: [{
      label: 'PPI',
      data: progress.value.map(p => p.ppi),
      borderColor: '#3B82F6',
      tension: 0.4,
      fill: false,
    }]
  }
})

const radarOptions = { scales: { r: { min: 0, max: 150 } } }
const lineOptions  = { scales: { y: { min: 0, max: 150 } } }
</script>

<template>
  <div v-if="loading" class="flex justify-center py-12">
    <svg class="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>

  <!-- Error -->
  <div v-else-if="errorMsg" class="card text-center py-12">
    <p class="text-red-500 font-medium">{{ errorMsg }}</p>
    <RouterLink to="/participants" class="mt-3 inline-block text-sm text-primary-600 hover:underline">← Kembali ke daftar peserta</RouterLink>
  </div>

  <div v-else-if="participant" class="space-y-6">
    <!-- Back -->
    <RouterLink to="/participants" class="text-sm text-primary-600 hover:underline flex items-center gap-1">
      ← Kembali ke daftar peserta
    </RouterLink>

    <!-- Profile -->
    <div class="card">
      <div class="flex items-start gap-4">
        <div class="h-14 w-14 bg-primary-100 rounded-full flex items-center justify-center text-2xl font-bold text-primary-700">
          {{ participant.full_name.charAt(0) }}
        </div>
        <div class="flex-1">
          <h1 class="text-xl font-bold text-gray-900">{{ participant.full_name }}</h1>
          <div class="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            <span>{{ participant.gender === 'male' ? 'Laki-laki' : 'Perempuan' }}</span>
            <span v-if="participant.date_of_birth">{{ formatDate(participant.date_of_birth) }} ({{ participant.age }} thn)</span>
            <span v-if="participant.weight_kg">{{ participant.weight_kg }} kg</span>
            <span v-if="participant.height_cm">{{ participant.height_cm }} cm</span>
            <span v-if="participant.hr_max">HR Max: {{ participant.hr_max }}</span>
          </div>
          <div class="flex gap-2 mt-2">
            <span :class="participant.is_athlete ? 'badge-good' : 'badge-average'">
              {{ participant.is_athlete ? 'Atlet' : 'Siswa' }}
            </span>
            <span v-if="participant.sport_branch || participant.class_name" class="text-xs text-gray-500 self-center">
              {{ participant.is_athlete ? participant.sport_branch : participant.class_name }}
            </span>
          </div>
        </div>
        <RouterLink :to="`/sessions/new?participant=${participant.id}`" class="btn-primary text-xs">
          + Sesi Baru
        </RouterLink>
      </div>
    </div>

    <!-- Charts -->
    <div v-if="progress.length" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h2 class="font-semibold text-gray-900 mb-4">Radar Performa (Terakhir)</h2>
        <Radar v-if="radarData" :data="radarData" :options="radarOptions" />
      </div>
      <div class="card">
        <h2 class="font-semibold text-gray-900 mb-4">Tren PPI</h2>
        <Line v-if="lineData" :data="lineData" :options="lineOptions" />
        <div v-else class="text-center py-8 text-gray-400 text-sm">Perlu minimal 2 sesi untuk tren.</div>
      </div>
    </div>

    <!-- Test History -->
    <div class="card">
      <h2 class="font-semibold text-gray-900 mb-4">Riwayat Tes</h2>
      <div v-if="!progress.length" class="text-center py-8 text-gray-400 text-sm">
        Belum ada sesi tes untuk peserta ini.
      </div>
      <div v-else class="space-y-3">
        <div v-for="p in [...progress].reverse()" :key="p.session_id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p class="font-medium text-sm text-gray-900">{{ p.academic_year }} — Semester {{ p.semester }}</p>
            <p class="text-xs text-gray-500">{{ formatDateTime(p.test_date) }}</p>
          </div>
          <div class="flex items-center gap-3">
            <PPIBadge v-if="p.ppi" :ppi="p.ppi" />
            <RouterLink :to="`/sessions/${p.session_id}`" class="text-xs text-primary-600 hover:underline">
              Detail
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
