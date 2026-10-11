<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { dashboardApi } from '@/api/dashboard'
import DataTable, { type DtColumn } from '@/components/common/DataTable.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { formatDateTime } from '@/utils/date'

const appName  = import.meta.env.VITE_APP_NAME ?? 'SM ATAPP'
const stats    = ref<any>(null)
const sessions = ref<any[]>([])
const loading  = ref(true)

const statItems = [
  { key: 'total_participants', label: 'Total peserta' },
  { key: 'total_athletes',     label: 'Atlet' },
  { key: 'total_students',     label: 'Siswa PJOK' },
  { key: 'total_sessions',     label: 'Sesi tes' },
]

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
    <PageHeader title="Dashboard" :subtitle="`Ringkasan aktivitas di ${appName}`">
      <RouterLink to="/sessions/new" class="btn-secondary">+ Sesi Tes Baru</RouterLink>
      <RouterLink to="/participants" class="btn-primary">+ Tambah Peserta</RouterLink>
    </PageHeader>

    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="card h-28 animate-pulse bg-gray-100" />
    </div>

    <dl v-else-if="stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="item in statItems" :key="item.label" class="card !p-5">
        <dt class="text-sm text-gray-500">{{ item.label }}</dt>
        <dd class="mt-2 text-3xl font-bold tracking-tight text-gray-900">{{ stats[item.key] }}</dd>
      </div>
    </dl>

    <!-- Recent sessions DataTable -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Sesi terbaru</h2>
        <RouterLink to="/sessions" class="act">Lihat semua</RouterLink>
      </div>

      <DataTable
        :columns="sessionColumns"
        :data="sessions"
        :loading="loading"
        :searchable="false"
        compact
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
              <RouterLink :to="`/sessions/${s.id}`" class="act act-primary">Detail</RouterLink>
            </td>
          </tr>
        </template>
      </DataTable>
    </div>
  </div>
</template>
