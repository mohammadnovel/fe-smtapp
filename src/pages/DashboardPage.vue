<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { dashboardApi } from '@/api/dashboard'
import DataTable, { type DtColumn } from '@/components/common/DataTable.vue'
import PPIBadge from '@/components/common/PPIBadge.vue'
import { formatDateTime } from '@/utils/date'

const appName  = import.meta.env.VITE_APP_NAME ?? 'SM ATAPP'
const stats    = ref<any>(null)
const sessions = ref<any[]>([])
const loading  = ref(true)

const sessionColumns: DtColumn[] = [
  { key: 'participant_name', label: 'Peserta' },
  { key: 'academic_year',    label: 'Periode',      class: 'hidden sm:table-cell' },
  { key: 'test_date',        label: 'Tanggal',      class: 'hidden md:table-cell' },
  { key: 'status',           label: 'Status' },
  { key: 'actions',          label: '',             sortable: false },
]

onMounted(async () => {
  try {
    const { data } = await dashboardApi.index()
    stats.value    = data.stats
    sessions.value = (data.recent_sessions as any[]).map((s: any) => ({
      ...s,
      participant_name: s.participant?.full_name ?? '—',
    }))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page title -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-500 text-sm">Selamat datang di {{ appName }}</p>
    </div>

    <!-- Stats cards skeleton -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="card h-24 animate-pulse bg-gray-100" />
    </div>

    <!-- Stats cards -->
    <div v-else-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card text-center">
        <p class="text-3xl font-bold text-primary-600">{{ stats.total_participants }}</p>
        <p class="text-sm text-gray-500 mt-1">Total Peserta</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-blue-600">{{ stats.total_athletes }}</p>
        <p class="text-sm text-gray-500 mt-1">Atlet</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-emerald-600">{{ stats.total_students }}</p>
        <p class="text-sm text-gray-500 mt-1">Siswa PJOK</p>
      </div>
      <div class="card text-center">
        <p class="text-3xl font-bold text-amber-600">{{ stats.total_sessions }}</p>
        <p class="text-sm text-gray-500 mt-1">Sesi Tes</p>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="flex gap-3 flex-wrap">
      <RouterLink to="/participants" class="btn-primary">+ Tambah Peserta</RouterLink>
      <RouterLink to="/sessions/new"  class="btn-secondary">+ Sesi Tes Baru</RouterLink>
    </div>

    <!-- Recent sessions DataTable -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-gray-900">Sesi Terbaru</h2>
        <RouterLink to="/sessions" class="text-sm text-primary-600 hover:underline">Lihat semua →</RouterLink>
      </div>

      <DataTable
        :columns="sessionColumns"
        :data="sessions"
        :loading="loading"
        empty-message="Belum ada sesi tes."
      >
        <template #default="{ rows }">
          <tr v-for="s in rows" :key="s.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3">
              <p class="font-medium text-sm text-gray-900">{{ s.participant_name }}</p>
              <p class="text-xs text-gray-400">{{ s.participant?.is_athlete ? 'Atlet' : 'Siswa' }}</p>
            </td>
            <td class="px-4 py-3 hidden sm:table-cell">
              <p class="text-sm text-gray-600">{{ s.academic_year }}</p>
              <p class="text-xs text-gray-400">Semester {{ s.semester }}</p>
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-sm text-gray-500">{{ formatDateTime(s.test_date) }}</td>
            <td class="px-4 py-3">
              <span :class="s.status === 'final' ? 'badge-good' : 'badge-average'">
                {{ s.status === 'final' ? 'Final' : 'Draft' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <RouterLink :to="`/sessions/${s.id}`" class="text-xs text-primary-600 hover:underline font-medium">Detail</RouterLink>
            </td>
          </tr>
        </template>
      </DataTable>
    </div>
  </div>
</template>
