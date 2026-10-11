<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { sessionsApi } from '@/api/sessions'
import BaseButton from '@/components/common/BaseButton.vue'
import { calcPowerWatt, calcFatigueIndex } from '@/composables/useCalculations'
import { useToast } from '@/composables/useToast'

const toast = useToast()

const props = defineProps<{ sessionId: string; weightKg: number }>()

const sprints = ref(Array.from({ length: 6 }, (_, i) => ({
  sprint_number: i + 1,
  time_seconds: '',
  speed_mps: null as number | null,
  power_watt: null as number | null,
})))

const results = ref<any>(null)
const saving  = ref(false)
const open    = ref(false)

function onInput(i: number) {
  const t = parseFloat(sprints.value[i].time_seconds)
  if (!isNaN(t) && t > 0) {
    sprints.value[i].speed_mps  = Math.round(35 / t * 10000) / 10000
    sprints.value[i].power_watt = calcPowerWatt(props.weightKg, t)
  }
}

const liveResults = computed(() => {
  const powers = sprints.value
    .map(s => s.power_watt)
    .filter((p): p is number => p !== null)
  if (powers.length < 6) return null
  const times = sprints.value.map(s => parseFloat(s.time_seconds)).filter(t => !isNaN(t))
  const totalTime = times.reduce((a, b) => a + b, 0)
  return {
    max_power:     Math.max(...powers),
    min_power:     Math.min(...powers),
    avg_power:     Math.round(powers.reduce((a, b) => a + b, 0) / powers.length * 1000) / 1000,
    fatigue_index: calcFatigueIndex(powers, totalTime),
  }
})

async function save() {
  saving.value = true
  try {
    const { data } = await sessionsApi.saveAnaerobicSprints(props.sessionId, {
      sprints: sprints.value.map(s => ({
        sprint_number: s.sprint_number,
        time_seconds:  parseFloat(s.time_seconds),
      })),
    })
    results.value = data.results
    sprints.value = data.sprints.map((s: any) => ({
      sprint_number: s.sprint_number,
      time_seconds:  s.time_seconds.toString(),
      speed_mps:     s.speed_mps,
      power_watt:    s.power_watt,
    }))
    toast.success('Data RAST berhasil disimpan.')
  } catch {
    toast.error('Gagal menyimpan data RAST.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await sessionsApi.getAnaerobicSprints(props.sessionId)
    if (data.length) {
      sprints.value = data.map((s: any) => ({
        sprint_number: s.sprint_number,
        time_seconds:  s.time_seconds.toString(),
        speed_mps:     s.speed_mps,
        power_watt:    s.power_watt,
      }))
    }
  } catch { /* empty */ }
})
</script>

<template>
  <div class="card">
    <button @click="open = !open" class="w-full flex items-center justify-between">
      <h2 class="font-semibold text-gray-900">RAST 35m (Kapasitas Anaerobik)</h2>
      <svg :class="['h-5 w-5 text-gray-400 transition-transform', open ? 'rotate-180' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-if="open" class="mt-4 space-y-4">
      <!-- Live results -->
      <div v-if="liveResults" class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-blue-50 rounded-lg">
        <div class="text-center">
          <p class="text-lg font-bold text-blue-700">{{ liveResults.max_power.toFixed(1) }}</p>
          <p class="text-xs text-gray-500">Max Power (W)</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-bold text-blue-700">{{ liveResults.min_power.toFixed(1) }}</p>
          <p class="text-xs text-gray-500">Min Power (W)</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-bold text-blue-700">{{ liveResults.avg_power.toFixed(1) }}</p>
          <p class="text-xs text-gray-500">Avg Power (W)</p>
        </div>
        <div class="text-center">
          <p class="text-lg font-bold text-orange-600">{{ liveResults.fatigue_index.toFixed(3) }}</p>
          <p class="text-xs text-gray-500">Fatigue Index</p>
        </div>
      </div>

      <!-- Sprint inputs -->
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead>
            <tr class="text-xs text-gray-500 border-b">
              <th class="py-2 pr-3 text-left">Sprint</th>
              <th class="py-2 pr-3 text-left">Waktu (s)</th>
              <th class="py-2 pr-3 text-left">Kecepatan (m/s)</th>
              <th class="py-2 text-left">Power (W)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(s, i) in sprints" :key="i" class="border-b border-gray-50">
              <td class="py-2 pr-3 font-medium text-gray-700">Sprint {{ s.sprint_number }}</td>
              <td class="py-2 pr-3">
                <input
                  v-model="s.time_seconds"
                  type="number"
                  step="0.001"
                  placeholder="e.g. 4.823"
                  class="input-field py-1 w-28 text-sm"
                  @input="onInput(i)"
                />
              </td>
              <td class="py-2 pr-3 text-gray-500">{{ s.speed_mps?.toFixed(4) ?? '—' }}</td>
              <td class="py-2 text-gray-500">{{ s.power_watt?.toFixed(1) ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-xs text-gray-400">Berat peserta: {{ weightKg }} kg — digunakan untuk kalkulasi power</p>

      <div class="flex justify-end">
        <BaseButton size="sm" :loading="saving" @click="save">Simpan & Hitung</BaseButton>
      </div>
    </div>
  </div>
</template>
