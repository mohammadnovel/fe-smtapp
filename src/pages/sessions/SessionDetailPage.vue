<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import { sessionsApi } from '@/api/sessions'
import { getPPICategory } from '@/composables/useCalculations'
import { Radar } from 'vue-chartjs'
import http from '@/api/http'
import { useToast } from '@/composables/useToast'
import { formatDateTime } from '@/utils/date'

const route    = useRoute()
const store    = useSessionsStore()
const toast    = useToast()
const loading  = ref(true)
const errorMsg = ref('')
const ppiData  = ref<any>(null)
const exporting = ref<'pdf' | 'excel' | null>(null)
const radarRef  = ref<any>(null)

onMounted(async () => {
  const id = Number(route.params.id)
  try {
    await store.fetchSession(id)
    const { data } = await sessionsApi.getPPI(id)
    ppiData.value = {
      ...data,
      ppi: parseFloat(data.ppi),
      components: (data.components as any[]).map((c: any) => ({
        ...c,
        avg_percentage: parseFloat(c.avg_percentage),
      })),
    }
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message ?? 'Gagal memuat detail sesi.'
  } finally {
    loading.value = false
  }
})

const session = computed(() => store.current)

const radarData = computed(() => {
  if (!ppiData.value?.components?.length) return null
  const labels = ppiData.value.components.map((c: any) => c.component)
  const values = ppiData.value.components.map((c: any) => c.avg_percentage)
  return {
    labels,
    datasets: [{
      label: '% vs Benchmark',
      data: values,
      backgroundColor: 'rgba(16,185,129,0.15)',
      borderColor: '#10b981',
      pointBackgroundColor: '#10b981',
    }],
  }
})

const radarOptions = {
  scales: { r: { min: 0, max: 130, ticks: { stepSize: 25 } } },
  plugins: { legend: { display: false } },
  maintainAspectRatio: true,
}

const groupedResults = computed(() => {
  if (!session.value?.test_results?.length) return {}
  const groups: Record<string, any[]> = {}
  for (const r of session.value.test_results) {
    if (!groups[r.component]) groups[r.component] = []
    groups[r.component].push(r)
  }
  return groups
})

async function downloadExport(format: 'pdf' | 'excel') {
  if (!session.value) return
  exporting.value = format
  try {
    // Capture Chart.js radar as base64 PNG
    // radarRef.value.chart is the Chart.js instance (proxyRefs auto-unwraps defineExpose)
    const chartInst = radarRef.value?.chart
    const chartImage: string | null = chartInst?.toBase64Image?.('image/png')
      ?? (chartInst?.canvas as HTMLCanvasElement | undefined)?.toDataURL('image/png')
      ?? null

    const endpoint = `/test-sessions/${session.value.id}/export/${format}`
    const response = await http.post(endpoint, { chart_image: chartImage }, { responseType: 'blob' })

    const ext  = format === 'pdf' ? 'pdf' : 'xlsx'
    const mime = format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const name = `sesi-${session.value.id}-${session.value.participant?.full_name?.replace(/\s+/g, '-') ?? 'export'}.${ext}`
    const url  = URL.createObjectURL(new Blob([response.data], { type: mime }))
    const a    = document.createElement('a')
    a.href     = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    toast.error('Gagal mengunduh laporan.')
  } finally {
    exporting.value = null
  }
}
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="flex justify-center py-12">
    <svg class="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>

  <!-- Error -->
  <div v-else-if="errorMsg" class="card text-center py-12">
    <p class="text-red-500 font-medium">{{ errorMsg }}</p>
    <RouterLink to="/sessions" class="mt-4 inline-block text-sm text-primary-600 hover:underline">← Kembali ke daftar sesi</RouterLink>
  </div>

  <!-- Content -->
  <div v-else-if="session" class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <RouterLink :to="`/participants/${session.participant?.id}`" class="text-sm text-primary-600 hover:underline">
          ← {{ session.participant?.full_name }}
        </RouterLink>
        <h1 class="text-xl font-bold text-gray-900 mt-1">
          Sesi Tes — {{ session.academic_year }} Sem {{ session.semester }}
        </h1>
        <p class="text-sm text-gray-500">{{ formatDateTime(session.test_date) }} · {{ session.location ?? 'Lokasi tidak ditentukan' }}</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <RouterLink v-if="session.status === 'draft'" :to="`/sessions/${session.id}/input`" class="btn-primary text-sm">
          Edit Input
        </RouterLink>
        <span :class="session.status === 'final' ? 'badge-good' : 'badge-average'">
          {{ session.status === 'final' ? 'Final' : 'Draft' }}
        </span>
        <!-- Export buttons -->
        <button
          @click="downloadExport('pdf')"
          :disabled="exporting !== null"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 bg-white hover:bg-red-50 text-sm font-medium disabled:opacity-50 transition-colors"
        >
          <svg v-if="exporting === 'pdf'" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <svg v-else class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          PDF
        </button>
        <button
          @click="downloadExport('excel')"
          :disabled="exporting !== null"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 text-sm font-medium disabled:opacity-50 transition-colors"
        >
          <svg v-if="exporting === 'excel'" class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <svg v-else class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Excel
        </button>
      </div>
    </div>

    <!-- PPI & Radar -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- PPI Card -->
      <div class="card">
        <h2 class="font-semibold text-gray-900 mb-4">Physical Performance Index</h2>
        <div v-if="ppiData" class="text-center py-4">
          <p class="text-5xl font-bold" :style="{ color: getPPICategory(ppiData.ppi).color }">
            {{ ppiData.ppi.toFixed(1) }}%
          </p>
          <p class="text-lg mt-1 font-medium" :style="{ color: getPPICategory(ppiData.ppi).color }">
            {{ getPPICategory(ppiData.ppi).label }}
          </p>
        </div>
        <div v-else class="text-center py-8 text-gray-400 text-sm">Belum ada data tes.</div>
        <!-- Component bars -->
        <div v-if="ppiData?.components?.length" class="mt-4 space-y-2.5">
          <div v-for="c in ppiData.components" :key="c.component" class="flex items-center gap-3">
            <span class="text-xs text-gray-600 w-28 truncate flex-shrink-0">{{ c.component }}</span>
            <div class="flex-1 bg-gray-100 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :style="{
                  width: `${Math.min(100, c.avg_percentage)}%`,
                  backgroundColor: c.avg_percentage >= 100 ? '#10b981' : c.avg_percentage >= 80 ? '#f59e0b' : '#ef4444',
                }"
              />
            </div>
            <span class="text-xs font-medium w-10 text-right tabular-nums">{{ c.avg_percentage.toFixed(0) }}%</span>
          </div>
        </div>
      </div>

      <!-- Radar Card -->
      <div class="card">
        <h2 class="font-semibold text-gray-900 mb-4">Radar Performa</h2>
        <Radar v-if="radarData" ref="radarRef" :data="radarData" :options="radarOptions" />
        <div v-else class="text-center py-8 text-gray-400 text-sm">Isi data tes untuk melihat radar.</div>
      </div>
    </div>

    <!-- Empty results notice -->
    <div v-if="session.status === 'draft' && !session.test_results?.length" class="card text-center py-8">
      <p class="text-gray-500 text-sm">Sesi masih draft dan belum ada hasil tes.</p>
      <RouterLink :to="`/sessions/${session.id}/input`" class="mt-2 inline-block text-sm text-primary-600 hover:underline font-medium">
        Input Hasil Tes →
      </RouterLink>
    </div>

    <!-- Results by Component -->
    <div v-for="(items, component) in groupedResults" :key="component" class="card">
      <h2 class="font-semibold text-gray-900 mb-3">{{ component }}</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-xs text-gray-500 border-b">
              <th class="pb-2 text-left font-medium">Item Tes</th>
              <th class="pb-2 text-right font-medium">Hasil</th>
              <th class="pb-2 text-right font-medium">Benchmark</th>
              <th class="pb-2 text-right font-medium">%</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in items" :key="r.id" class="border-b border-gray-50 last:border-0">
              <td class="py-2 text-gray-700">
                {{ r.test_item }}
                <span v-if="r.lower_is_better" class="text-xs text-blue-400 ml-1">(↑ lebih baik)</span>
              </td>
              <td class="py-2 text-right font-medium">
                {{ r.result_value ?? '—' }}
                <span class="text-gray-400 text-xs">{{ r.unit }}</span>
              </td>
              <td class="py-2 text-right text-gray-500">{{ r.benchmark_value ?? '—' }}</td>
              <td class="py-2 text-right">
                <span v-if="r.percentage !== null" :class="[
                  'font-semibold',
                  r.is_strength ? 'text-emerald-600' : r.percentage >= 80 ? 'text-amber-600' : 'text-red-600',
                ]">{{ Number(r.percentage).toFixed(1) }}%</span>
                <span v-else class="text-gray-300">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- No session found -->
  <div v-else class="card text-center py-12">
    <p class="text-gray-400 text-sm">Sesi tidak ditemukan.</p>
    <RouterLink to="/sessions" class="mt-2 inline-block text-sm text-primary-600 hover:underline">← Kembali ke daftar sesi</RouterLink>
  </div>
</template>
