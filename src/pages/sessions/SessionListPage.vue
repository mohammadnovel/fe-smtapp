<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import BaseButton from '@/components/common/BaseButton.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import { useToast } from '@/composables/useToast'
import { formatDateTime } from '@/utils/date'

const toast = useToast()

const store        = useSessionsStore()
const page         = ref(1)
const perPage      = ref(20)
const search       = ref('')
const statusFilter = ref('')
const yearFilter   = ref('')

const perOptions = [10, 20, 25, 50]

const statusOptions = [
  { value: '',      label: 'Semua Status' },
  { value: 'final', label: 'Final' },
  { value: 'draft', label: 'Draft' },
]

const sortKey = ref('test_date')
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}
function sortIcon(key: string) {
  if (sortKey.value !== key) return 'none'
  return sortDir.value
}

const sortedSessions = computed(() => {
  if (!sortKey.value) return store.sessions
  return [...store.sessions].sort((a: any, b: any) => {
    const av = String(a[sortKey.value] ?? '')
    const bv = String(b[sortKey.value] ?? '')
    const cmp = av.localeCompare(bv, undefined, { numeric: true })
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

const columns = [
  { key: 'participant', label: 'Peserta',      sortable: false },
  { key: 'academic_year', label: 'Tahun Ajaran', sortable: true, class: 'hidden sm:table-cell' },
  { key: 'semester',    label: 'Semester',     sortable: true, class: 'hidden sm:table-cell' },
  { key: 'test_date',   label: 'Tanggal Tes',  sortable: true, class: 'hidden md:table-cell' },
  { key: 'status',      label: 'Status',       sortable: true },
  { key: 'actions',     label: '',             sortable: false },
]

const from = computed(() => store.pagination.total === 0 ? 0 : (page.value - 1) * perPage.value + 1)
const to   = computed(() => Math.min(page.value * perPage.value, store.pagination.total))

// Derive available academic years from loaded data (for filter chip)
const availableYears = computed(() => {
  const years = [...new Set(store.sessions.map((s: any) => s.academic_year))].sort().reverse()
  return years
})

function load() {
  store.fetchSessions({
    page:          page.value,
    per_page:      perPage.value,
    status:        statusFilter.value || undefined,
    academic_year: yearFilter.value || undefined,
    search:        search.value || undefined,
  })
}

onMounted(load)

watch([statusFilter, yearFilter, perPage], () => { page.value = 1; load() })

let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; load() }, 400)
})

async function deleteSession(id: number) {
  if (!confirm('Hapus sesi draft ini?')) return
  try {
    await store.deleteSession(id)
    toast.success('Sesi berhasil dihapus.')
  } catch {
    toast.error('Gagal menghapus sesi.')
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Sesi Tes</h1>
        <p class="text-sm text-gray-500">{{ store.pagination.total }} total sesi</p>
      </div>
      <RouterLink to="/sessions/new" class="btn-primary">+ Sesi Baru</RouterLink>
    </div>

    <!-- DataTable top bar -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm text-gray-600">Tampilkan</span>
        <select
          v-model="perPage"
          class="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="n in perOptions" :key="n" :value="n">{{ n }}</option>
        </select>
        <span class="text-sm text-gray-600">entri</span>

        <!-- Status filter -->
        <select
          v-model="statusFilter"
          class="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="o in statusOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>

        <!-- Year filter chips (from loaded data) -->
        <template v-if="availableYears.length">
          <button
            @click="yearFilter = ''"
            :class="['px-2.5 py-1 rounded-full text-xs font-medium border transition-colors', yearFilter === '' ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-primary-400']"
          >Semua</button>
          <button
            v-for="yr in availableYears"
            :key="yr"
            @click="yearFilter = yr"
            :class="['px-2.5 py-1 rounded-full text-xs font-medium border transition-colors', yearFilter === yr ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-600 hover:border-primary-400']"
          >{{ yr }}</button>
        </template>
      </div>

      <!-- Search -->
      <div class="relative">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="search" type="search" placeholder="Cari peserta…"
          class="rounded border border-gray-300 py-1.5 pl-8 pr-3 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-primary-500" />
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
              :class="['px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider select-none', col.class, col.sortable ? 'cursor-pointer hover:bg-gray-100' : '']"
              @click="col.sortable && toggleSort(col.key)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <span v-if="col.sortable" class="inline-flex flex-col gap-0">
                  <svg :class="['h-2 w-2', sortIcon(col.key) === 'asc' ? 'text-primary-600' : 'text-gray-300']" fill="currentColor" viewBox="0 0 320 512">
                    <path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"/>
                  </svg>
                  <svg :class="['h-2 w-2', sortIcon(col.key) === 'desc' ? 'text-primary-600' : 'text-gray-300']" fill="currentColor" viewBox="0 0 320 512">
                    <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"/>
                  </svg>
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-100">
          <tr v-if="store.loading">
            <td :colspan="columns.length" class="px-4 py-12 text-center">
              <svg class="animate-spin h-6 w-6 text-primary-500 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </td>
          </tr>
          <tr v-else-if="sortedSessions.length === 0">
            <td :colspan="columns.length" class="px-4 py-12 text-center text-gray-400 text-sm">
              {{ search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada sesi tes.' }}
            </td>
          </tr>
          <tr v-for="s in sortedSessions" v-else :key="s.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3">
              <p class="font-medium text-sm text-gray-900">{{ s.participant?.full_name }}</p>
              <p class="text-xs text-gray-400">{{ s.participant?.is_athlete ? 'Atlet' : 'Siswa' }}</p>
            </td>
            <td class="px-4 py-3 hidden sm:table-cell text-sm text-gray-700">{{ s.academic_year }}</td>
            <td class="px-4 py-3 hidden sm:table-cell text-sm text-gray-500">Semester {{ s.semester }}</td>
            <td class="px-4 py-3 hidden md:table-cell text-sm text-gray-600">{{ formatDateTime(s.test_date) }}</td>
            <td class="px-4 py-3">
              <span :class="s.status === 'final' ? 'badge-good' : 'badge-average'">
                {{ s.status === 'final' ? 'Final' : 'Draft' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 justify-end">
                <RouterLink :to="`/sessions/${s.id}`" class="text-xs text-primary-600 hover:underline font-medium">Detail</RouterLink>
                <RouterLink v-if="s.status === 'draft'" :to="`/sessions/${s.id}/input`" class="text-xs text-emerald-600 hover:underline font-medium">Input</RouterLink>
                <button v-if="s.status === 'draft'" @click="deleteSession(s.id)" class="text-xs text-red-500 hover:text-red-700">Hapus</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- DataTable bottom bar -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-gray-500">
        Menampilkan <span class="font-medium text-gray-700">{{ from }}</span>–<span class="font-medium text-gray-700">{{ to }}</span>
        dari <span class="font-medium text-gray-700">{{ store.pagination.total }}</span> entri
      </p>
      <BasePagination
        :current-page="store.pagination.current_page"
        :last-page="store.pagination.last_page"
        :total="store.pagination.total"
        @page="p => { page = p; load() }"
      />
    </div>
  </div>
</template>
