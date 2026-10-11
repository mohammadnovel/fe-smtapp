<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import SearchInput from '@/components/common/SearchInput.vue'

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
  searchable?: boolean
  compact?: boolean
}>(), {
  searchable: true,
  compact: false,
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
    <!-- Search -->
    <div v-if="searchable" class="toolbar">
      <SearchInput v-model="search" placeholder="Cari di tabel…" />
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="['dt-th', col.class, col.sortable !== false ? 'dt-sortable' : '']"
              :aria-sort="sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined"
              @click="toggleSort(col)"
            >
              <span class="inline-flex items-center gap-1.5">
                {{ col.label }}
                <svg v-if="col.sortable !== false" :class="['h-3 w-3', sortKey === col.key ? 'text-primary-600' : 'text-gray-300']" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path v-if="sortKey === col.key && sortDir === 'desc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  <path v-else-if="sortKey === col.key" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
                </svg>
              </span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-4 py-14 text-center">
              <svg class="animate-spin h-6 w-6 text-primary-500 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </td>
          </tr>
          <tr v-else-if="rows.length === 0">
            <td :colspan="columns.length" class="px-4 py-14 text-center text-gray-500 text-sm">
              {{ search ? `Tidak ada hasil untuk "${search}". Coba kata kunci lain.` : emptyMessage }}
            </td>
          </tr>
          <slot v-else :rows="rows" />
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div v-if="!loading" class="flex items-center justify-between flex-wrap gap-3 text-sm text-gray-500">
      <div class="flex items-center gap-4 flex-wrap">
        <p>
          <span class="font-medium text-gray-700">{{ from }}–{{ to }}</span> dari
          <span class="font-medium text-gray-700">{{ total }}</span>
        </p>
        <label v-if="!compact" class="flex items-center gap-2">
          <span>Baris</span>
          <select v-model="perPage" class="field-select !py-1 !text-xs">
            <option v-for="n in perOptions" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
      </div>
      <div v-if="lastPage > 1" class="flex items-center gap-1">
        <button @click="page--" :disabled="page <= 1" class="act disabled:opacity-40 disabled:cursor-not-allowed">Sebelumnya</button>
        <template v-for="p in pageRange" :key="String(p)">
          <button
            v-if="p !== '...'"
            @click="page = p as number"
            :aria-current="p === page ? 'page' : undefined"
            :class="['act min-w-[2rem] justify-center', p === page ? '!bg-primary-600 !border-primary-600 !text-white' : '']"
          >{{ p }}</button>
          <span v-else class="px-1 text-gray-400 text-xs self-center">…</span>
        </template>
        <button @click="page++" :disabled="page >= lastPage" class="act disabled:opacity-40 disabled:cursor-not-allowed">Berikutnya</button>
      </div>
    </div>
  </div>
</template>
