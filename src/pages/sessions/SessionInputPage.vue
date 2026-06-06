<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sessionsApi } from '@/api/sessions'
import { benchmarksApi } from '@/api/benchmarks'
import BaseButton from '@/components/common/BaseButton.vue'
import AlertBanner from '@/components/common/AlertBanner.vue'
import LyonTestForm from '@/components/sessions/LyonTestForm.vue'
import RASTForm from '@/components/sessions/RASTForm.vue'
import {
  TEST_ITEMS, calculatePercentage, calculatePPI,
  getPPICategory, groupByComponent
} from '@/composables/useCalculations'
import { useToast } from '@/composables/useToast'
import { formatDateTime } from '@/utils/date'

const toast = useToast()

const route  = useRoute()
const router = useRouter()

const session    = ref<any>(null)
const benchmarks = ref<Record<string, number>>({})
const loading    = ref(true)
const saving     = ref(false)
const error      = ref('')

// Reactive results map: { "component|test_item": { value, percentage } }
const results = reactive<Record<string, { value: string; percentage: number | null }>>({})

const components = groupByComponent(TEST_ITEMS)

const ppi = computed(() => {
  const percs = Object.values(results).map(r => r.percentage)
  return calculatePPI(percs)
})

const ppiCategory = computed(() => getPPICategory(ppi.value))

function benchmarkKey(component: string, testItem: string, gender: string) {
  return `${component}|${testItem}|${gender}`
}

function onInput(component: string, testItem: string, lowerIsBetter: boolean) {
  const key      = `${component}|${testItem}`
  const val      = parseFloat(results[key]?.value ?? '')
  const bench    = benchmarks.value[key] ?? null
  const perc     = bench && !isNaN(val) ? calculatePercentage(val, bench, lowerIsBetter) : null
  results[key].percentage = perc
}

function percentageClass(pct: number | null) {
  if (pct === null) return 'text-gray-400'
  if (pct >= 100)   return 'text-emerald-600 font-semibold'
  if (pct >= 80)    return 'text-amber-600'
  return                   'text-red-600'
}

onMounted(async () => {
  try {
    const id = Number(route.params.id)
    const [sessRes, benchRes] = await Promise.all([
      sessionsApi.get(id),
      benchmarksApi.list(),
    ])
    session.value = sessRes.data

    // Build benchmark map
    const gender = session.value.participant.gender
    for (const b of benchRes.data) {
      if (b.gender === gender && !b.school_id) {
        benchmarks.value[`${b.component}|${b.test_item}`] = b.benchmark_value
      }
    }

    // Init results from existing data
    for (const item of TEST_ITEMS) {
      const key      = `${item.component}|${item.test_item}`
      const existing = session.value.test_results?.find(
        (r: any) => r.component === item.component && r.test_item === item.test_item
      )
      results[key] = {
        value:      existing?.result_value?.toString() ?? '',
        percentage: existing?.percentage ?? null,
      }
    }
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  error.value  = ''
  try {
    const payload = TEST_ITEMS.map(item => {
      const key = `${item.component}|${item.test_item}`
      const val = results[key]?.value
      return {
        component:       item.component,
        test_item:       item.test_item,
        unit:            item.unit,
        lower_is_better: item.lower_is_better,
        result_value:    val !== '' && val != null ? parseFloat(val) : null,
      }
    }).filter(r => r.result_value !== null)

    await sessionsApi.saveResults(session.value.id, { results: payload })
    toast.success('Data tes berhasil disimpan.')
    return true
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Gagal menyimpan.'
    return false
  } finally {
    saving.value = false
  }
}

async function finalize() {
  if (!confirm('Finalisasi sesi? Data tidak dapat diubah setelah finalisasi.')) return
  const ok = await save()
  if (!ok) return
  try {
    await sessionsApi.finalize(session.value.id)
    toast.success('Sesi berhasil difinalisasi.')
    router.push(`/sessions/${session.value.id}`)
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Gagal memfinalisasi sesi.')
  }
}
</script>

<template>
  <div v-if="loading" class="flex justify-center py-12">
    <svg class="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>

  <div v-else-if="session" class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-xl font-bold text-gray-900">Input Tes: {{ session.participant.full_name }}</h1>
        <p class="text-sm text-gray-500">{{ session.academic_year }} — Sem {{ session.semester }} · {{ formatDateTime(session.test_date) }}</p>
      </div>
      <!-- PPI live display -->
      <div class="text-right">
        <p class="text-3xl font-bold" :style="{ color: ppiCategory.color }">{{ ppi.toFixed(1) }}%</p>
        <p class="text-sm" :style="{ color: ppiCategory.color }">PPI — {{ ppiCategory.label }}</p>
      </div>
    </div>

    <AlertBanner v-if="error" type="error" dismissable @dismiss="error = ''">{{ error }}</AlertBanner>

    <!-- 9-Component Input -->
    <div v-for="(items, component) in components" :key="component" class="card space-y-3">
      <h2 class="font-semibold text-gray-900 border-b border-gray-100 pb-2">{{ component }}</h2>
      <div class="space-y-2">
        <div v-for="item in items" :key="item.test_item" class="flex items-center gap-3 py-1">
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-800">{{ item.test_item }}</p>
            <p class="text-xs text-gray-400">
              Benchmark: {{ benchmarks[`${item.component}|${item.test_item}`] ?? '—' }} {{ item.unit }}
              <span v-if="item.lower_is_better" class="text-blue-500">(lebih rendah = lebih baik)</span>
            </p>
          </div>
          <div class="w-28 flex-shrink-0">
            <input
              v-model="results[`${item.component}|${item.test_item}`].value"
              type="number"
              step="0.01"
              :placeholder="item.unit"
              class="input-field text-right text-sm py-1.5"
              @input="onInput(item.component, item.test_item, item.lower_is_better)"
            />
          </div>
          <div class="w-16 text-right flex-shrink-0">
            <span
              v-if="results[`${item.component}|${item.test_item}`].percentage !== null"
              :class="['text-sm', percentageClass(results[`${item.component}|${item.test_item}`].percentage)]"
            >
              {{ results[`${item.component}|${item.test_item}`].percentage?.toFixed(1) }}%
            </span>
            <span v-else class="text-gray-300 text-sm">—</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Lyon Test (Aerobic) -->
    <LyonTestForm :session-id="session.id" />

    <!-- RAST (Anaerobic) -->
    <RASTForm :session-id="session.id" :weight-kg="session.participant?.weight_kg ?? 70" />

    <!-- Actions -->
    <div class="flex justify-end gap-3 sticky bottom-4">
      <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-3 flex gap-3">
        <BaseButton variant="secondary" @click="router.push(`/sessions/${session.id}`)">Lihat Detail</BaseButton>
        <BaseButton @click="save" :loading="saving">Simpan Draft</BaseButton>
        <BaseButton variant="danger" @click="finalize">Finalisasi</BaseButton>
      </div>
    </div>
  </div>
</template>
