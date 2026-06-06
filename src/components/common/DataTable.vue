<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface DtColumn {
  key: string
  label: string
  sortable?: boolean
  class?: string
}

const props = withDefaults(defineProps<{
  columns: DtColumn[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
}>(), {
  loading: false,
  emptyMessage: 'Tidak ada data.',
})

const perPage    = ref(10)
const perOptions = [10, 25, 50, 100]
const search     = ref('')
const sortKey    = ref('')
const sortDir    = ref<'asc' | 'desc'>('asc')
const page       = ref(1)

const filtered = computed(() => {
  if (!search.value.trim()) return props.data
  const q = search.value.toLowerCase()
  return props.data.filter(row =>
    Object.values(row).some(v => String(v ?? '').toLowerCase().includes(q))
  )
})

const sorted = computed(() => {
  if (!sortKey.value) return filtered.value
  return [...filtered.value].sort((a, b) => {
    const av = String(a[sortKey.value] ?? '')
    const bv = String(b[sortKey.value] ?? '')
    const cmp = av.localeCompare(bv, undefined, { numeric: true })
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

const total    = computed(() => sorted.value.length)
const lastPage = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))
const rows     = computed(() => sorted.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))
const from     = computed(() => total.value === 0 ? 0 : (page.value - 1) * perPage.value + 1)
const to       = computed(() => Math.min(page.value * perPage.value, total.value))

const pageRange = computed<(number | '...')[]>(() => {
  const range: (number | '...')[] = []
  for (let p = 1; p <= lastPage.value; p++) {
    if (p === 1 || p === lastPage.value || Math.abs(p - page.value) <= 1) {
      range.push(p)
    } else if (range[range.length - 1] !== '...') {
      range.push('...')
    }
  }
  return range
})

watch(search,          () => { page.value = 1 })
watch(perPage,         () => { page.value = 1 })
watch(() => props.data, () => { page.value = 1 })

function toggleSort(col: DtColumn) {
  if (col.sortable === false) return
  if (sortKey.value === col.key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = col.key
    sortDir.value = 'asc'
  }
  page.value = 1
}
</script>

<template>
  <div class="space-y-3">
    <!-- Top bar -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span>Tampilkan</span>
        <select
          v-model="perPage"
          class="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option v-for="n in perOptions" :key="n" :value="n">{{ n }}</option>
        </select>
        <span>entri</span>
      </div>
      <div class="relative">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          v-model="search"
          type="search"
          placeholder="Cari..."
          class="rounded border border-gray-300 py-1.5 pl-8 pr-3 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider select-none',
                col.class,
                col.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
              ]"
              @click="toggleSort(col)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <span v-if="col.sortable !== false" class="inline-flex flex-col gap-0">
                  <svg :class="['h-2 w-2', sortKey === col.key && sortDir === 'asc' ? 'text-primary-600' : 'text-gray-300']" fill="currentColor" viewBox="0 0 320 512">
                    <path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"/>
                  </svg>
                  <svg :class="['h-2 w-2', sortKey === col.key && sortDir === 'desc' ? 'text-primary-600' : 'text-gray-300']" fill="currentColor" viewBox="0 0 320 512">
                    <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"/>
                  </svg>
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-4 py-12 text-center">
              <svg class="animate-spin h-6 w-6 text-primary-500 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </td>
          </tr>
          <tr v-else-if="rows.length === 0">
            <td :colspan="columns.length" class="px-4 py-12 text-center text-gray-400 text-sm">
              {{ search ? `Tidak ada hasil untuk "${search}"` : emptyMessage }}
            </td>
          </tr>
          <slot v-else :rows="rows" />
        </tbody>
      </table>
    </div>

    <!-- Bottom bar -->
    <div v-if="!loading" class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-gray-500">
        Menampilkan <span class="font-medium text-gray-700">{{ from }}</span>–<span class="font-medium text-gray-700">{{ to }}</span>
        dari <span class="font-medium text-gray-700">{{ total }}</span> entri
      </p>
      <div class="flex items-center gap-1">
        <button
          @click="page--"
          :disabled="page <= 1"
          :class="['px-3 py-1.5 rounded border text-xs font-medium transition-colors', page <= 1 ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700']"
        >Prev</button>
        <template v-for="p in pageRange" :key="String(p)">
          <button
            v-if="p !== '...'"
            @click="page = p as number"
            :class="['px-3 py-1.5 rounded border text-xs font-medium transition-colors min-w-[2rem]', p === page ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700']"
          >{{ p }}</button>
          <span v-else class="px-1 text-gray-400 text-xs self-center">…</span>
        </template>
        <button
          @click="page++"
          :disabled="page >= lastPage"
          :class="['px-3 py-1.5 rounded border text-xs font-medium transition-colors', page >= lastPage ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700']"
        >Next</button>
      </div>
    </div>
  </div>
</template>
