<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchInput from '@/components/common/SearchInput.vue'
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
  { value: '',      label: 'Semua' },
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

async function deleteSession(id: string) {
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
    <PageHeader title="Sesi Tes" :subtitle="`${store.pagination.total} sesi tercatat`">
      <RouterLink to="/sessions/new" class="btn-primary">+ Sesi Baru</RouterLink>
    </PageHeader>

    <div class="toolbar">
      <div class="flex flex-wrap items-center gap-3">
        <SearchInput v-model="search" placeholder="Cari peserta…" />
        <div class="seg" role="group" aria-label="Filter status">
          <button v-for="o in statusOptions" :key="o.value" @click="statusFilter = o.value"
            :aria-pressed="statusFilter === o.value"
            :class="['seg-btn', statusFilter === o.value ? 'seg-btn-on' : '']">{{ o.label }}</button>
        </div>
        <select v-if="availableYears.length" v-model="yearFilter" class="field-select" aria-label="Tahun ajaran">
          <option value="">Semua tahun ajaran</option>
          <option v-for="yr in availableYears" :key="yr" :value="yr">{{ yr }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="['dt-th', col.class, col.sortable ? 'dt-sortable' : '']"
              @click="col.sortable && toggleSort(col.key)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <svg v-if="col.sortable" :class="['h-3 w-3', sortIcon(col.key) !== 'none' ? 'text-primary-600' : 'text-gray-300']" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path v-if="sortIcon(col.key) === 'desc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  <path v-else-if="sortIcon(col.key) === 'asc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4M16 15l-4 4-4-4" />
                </svg>
              </span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="store.loading">
            <td :colspan="columns.length" class="px-4 py-14 text-center">
              <svg class="animate-spin h-6 w-6 text-primary-500 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </td>
          </tr>
          <tr v-else-if="sortedSessions.length === 0">
            <td :colspan="columns.length" class="px-4 py-14 text-center text-gray-400 text-sm">
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
              <div class="flex items-center gap-1.5 justify-end">
                <RouterLink :to="`/sessions/${s.id}`" class="act act-primary">Detail</RouterLink>
                <RouterLink v-if="s.status === 'draft'" :to="`/sessions/${s.id}/input`" class="act act-success">Input</RouterLink>
                <button v-if="s.status === 'draft'" @click="deleteSession(s.id)" class="act act-danger">Hapus</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between flex-wrap gap-3 text-sm text-gray-500">
      <div class="flex items-center gap-4 flex-wrap">
        <p>
          <span class="font-medium text-gray-700">{{ from }}–{{ to }}</span> dari
          <span class="font-medium text-gray-700">{{ store.pagination.total }}</span>
        </p>
        <label class="flex items-center gap-2">
          <span>Baris</span>
          <select v-model="perPage" class="field-select !py-1 !text-xs">
            <option v-for="n in perOptions" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>
      </div>
      <BasePagination
        :current-page="store.pagination.current_page"
        :last-page="store.pagination.last_page"
        :total="store.pagination.total"
        @page="p => { page = p; load() }"
      />
    </div>
  </div>
</template>
