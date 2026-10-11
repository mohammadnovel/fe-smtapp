<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { sessionsApi } from '@/api/sessions'
import BaseButton from '@/components/common/BaseButton.vue'
import { calcVO2max } from '@/composables/useCalculations'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const props = defineProps<{ sessionId: string }>()

const laps    = ref<{ lap_number: number; time_cumulative: string; distance_meter: string; time_per_lap?: number | null; speed_mps?: number | null }[]>([])
const results = ref<any>(null)
const saving  = ref(false)
const open    = ref(false)

function addLap() {
  laps.value.push({
    lap_number: laps.value.length + 1,
    time_cumulative: '',
    distance_meter: '50',
  })
}

function removeLap(i: number) {
  laps.value.splice(i, 1)
  laps.value.forEach((l, idx) => { l.lap_number = idx + 1 })
}

async function save() {
  saving.value = true
  try {
    const { data } = await sessionsApi.saveAerobicLaps(props.sessionId, {
      laps: laps.value.map(l => ({
        lap_number:      l.lap_number,
        time_cumulative: parseFloat(l.time_cumulative),
        distance_meter:  parseFloat(l.distance_meter) || 50,
      })),
    })
    results.value = data.results
    laps.value    = data.laps
    toast.success('Data Lyon Test berhasil disimpan.')
  } catch {
    toast.error('Gagal menyimpan data Lyon Test.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await sessionsApi.getAerobicLaps(props.sessionId)
    if (data.length) {
      laps.value    = data.map((l: any) => ({
        lap_number:     l.lap_number,
        time_cumulative: l.time_cumulative.toString(),
        distance_meter: l.distance_meter.toString(),
      }))
    }
  } catch { /* empty session */ }
})
</script>

<template>
  <div class="card">
    <button @click="open = !open" class="w-full flex items-center justify-between">
      <h2 class="font-semibold text-gray-900">Lyon Test (Kapasitas Aerobik)</h2>
      <svg :class="['h-5 w-5 text-gray-400 transition-transform', open ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="open" class="mt-4 space-y-4">
      <!-- Results display -->
      <div v-if="results" class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-emerald-50 rounded-lg">
        <div class="text-center">
          <p class="text-lg font-bold text-emerald-700">{{ results.mas?.toFixed(2) }}</p>
          <p class="text-xs text-gray-500">MAS (m/s)</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-bold text-emerald-700">{{ results.vo2max?.toFixed(1) }}</p>
          <p class="text-xs text-gray-500">VO2max (ml/kg/min)</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-bold text-gray-700">{{ results.total_distance }}</p>
          <p class="text-xs text-gray-500">Jarak Total (m)</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-bold text-gray-700">{{ results.total_time?.toFixed(1) }}</p>
          <p class="text-xs text-gray-500">Waktu Total (s)</p>
        </div>
      </div>

      <!-- Laps table -->
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-xs text-gray-500 border-b">
              <th class="py-2 pr-3 text-left">Lap</th>
              <th class="py-2 pr-3 text-left">Waktu Kumulatif (s)</th>
              <th class="py-2 pr-3 text-left">Jarak/Lap (m)</th>
              <th class="py-2 text-left">Time/Lap</th>
              <th class="py-2 text-left">Kecepatan (m/s)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(lap, i) in laps" :key="i" class="border-b border-gray-50">
              <td class="py-2 pr-3 font-medium text-gray-700">{{ lap.lap_number }}</td>
              <td class="py-2 pr-3">
                <input v-model="lap.time_cumulative" type="number" step="0.1" class="input-field py-1 w-28 text-sm" placeholder="e.g. 32.5" />
              </td>
              <td class="py-2 pr-3">
                <input v-model="lap.distance_meter" type="number" step="1" class="input-field py-1 w-20 text-sm" />
              </td>
              <td class="py-2 pr-3 text-gray-500">
                {{ lap.time_per_lap != null ? lap.time_per_lap.toFixed(2) : '—' }}
              </td>
              <td class="py-2 text-gray-500">
                {{ lap.speed_mps != null ? lap.speed_mps.toFixed(3) : '—' }}
              </td>
              <td class="py-2 pl-2">
                <button @click="removeLap(i)" class="text-red-400 hover:text-red-600 text-xs">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex gap-3">
        <BaseButton variant="secondary" size="sm" @click="addLap">+ Tambah Lap</BaseButton>
        <BaseButton size="sm" :loading="saving" @click="save">Simpan & Hitung</BaseButton>
      </div>
    </div>
  </div>
</template>
