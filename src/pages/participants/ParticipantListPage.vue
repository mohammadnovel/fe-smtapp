<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useParticipantsStore } from '@/stores/participants'
import BaseButton from '@/components/common/BaseButton.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchInput from '@/components/common/SearchInput.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import ParticipantForm from '@/components/participants/ParticipantForm.vue'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/date'

const toast = useToast()

const store      = useParticipantsStore()
const page       = ref(1)
const perPage    = ref(20)
const search     = ref('')
const gender     = ref('')
const isAthlete  = ref('')
const showForm   = ref(false)
const editTarget = ref<any>(null)

const perOptions = [10, 20, 25, 50, 100]

const genderOptions = [
  { value: '', label: 'Semua Gender' },
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
]
const athleteOptions = [
  { value: '',      label: 'Semua Tipe' },
  { value: 'true',  label: 'Atlet' },
  { value: 'false', label: 'Siswa PJOK' },
]

const columns = [
  { label: 'Nama',           key: 'full_name' },
  { label: 'Gender',         key: 'gender',       class: 'hidden sm:table-cell' },
  { label: 'Kelas / Cabor',  key: 'class_sport',  class: 'hidden md:table-cell' },
  { label: 'BMI',            key: 'bmi',           class: 'hidden lg:table-cell' },
  { label: 'Tipe',           key: 'type' },
  { label: '',               key: 'actions',       sortable: false },
]

const sortKey = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

function sortIcon(key: string) {
  if (sortKey.value !== key) return 'none'
  return sortDir.value
}

const sortedParticipants = computed(() => {
  if (!sortKey.value) return store.participants
  return [...store.participants].sort((a: any, b: any) => {
    const av = String(a[sortKey.value] ?? '')
    const bv = String(b[sortKey.value] ?? '')
    const cmp = av.localeCompare(bv, undefined, { numeric: true })
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

const from = computed(() => store.pagination.total === 0 ? 0 : (page.value - 1) * perPage.value + 1)
const to   = computed(() => Math.min(page.value * perPage.value, store.pagination.total))

function load() {
  store.fetchParticipants({
    page: page.value,
    per_page: perPage.value,
    search: search.value || undefined,
    gender: (gender.value as any) || undefined,
    is_athlete: isAthlete.value !== '' ? isAthlete.value === 'true' : undefined,
  })
}

onMounted(() => { load(); store.fetchClasses() })

watch([page, gender, isAthlete, perPage], load)

let searchTimer: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { page.value = 1; load() }, 400)
})

watch(perPage, () => { page.value = 1 })

function openCreate() { editTarget.value = null; showForm.value = true }
function openEdit(p: any) { editTarget.value = p; showForm.value = true }

async function handleDelete(id: string) {
  if (!confirm('Yakin hapus peserta ini? Semua sesi tes terkait juga akan terhapus.')) return
  try {
    await store.deleteParticipant(id)
    toast.success('Peserta berhasil dihapus.')
  } catch {
    toast.error('Gagal menghapus peserta.')
  }
}
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Peserta" :subtitle="`${store.pagination.total} peserta terdaftar`">
      <BaseButton @click="openCreate">+ Tambah Peserta</BaseButton>
    </PageHeader>

    <div class="toolbar">
      <div class="flex flex-wrap items-center gap-3">
        <SearchInput v-model="search" placeholder="Cari nama…" />
        <select v-model="gender" class="field-select" aria-label="Jenis kelamin">
          <option v-for="o in genderOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <select v-model="isAthlete" class="field-select" aria-label="Tipe peserta">
          <option v-for="o in athleteOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
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
              :class="['dt-th', col.class, col.sortable !== false ? 'dt-sortable' : '']"
              @click="col.sortable !== false && toggleSort(col.key)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <svg v-if="col.sortable !== false" :class="['h-3 w-3', sortIcon(col.key) !== 'none' ? 'text-primary-600' : 'text-gray-300']" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
          <tr v-else-if="sortedParticipants.length === 0">
            <td :colspan="columns.length" class="px-4 py-14 text-center text-gray-400 text-sm">
              {{ search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada peserta.' }}
            </td>
          </tr>
          <tr v-for="p in sortedParticipants" v-else :key="p.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 bg-primary-100 rounded-md flex items-center justify-center text-primary-700 text-sm font-bold flex-shrink-0">
                  {{ p.full_name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="font-medium text-sm text-gray-900">{{ p.full_name }}</p>
                  <p class="text-xs text-gray-400">{{ formatDate(p.date_of_birth) }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 hidden sm:table-cell">
              <span class="text-sm text-gray-600">{{ p.gender === 'male' ? 'Laki-laki' : 'Perempuan' }}</span>
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-sm text-gray-600">
              {{ p.is_athlete ? (p.sport_branch ?? '—') : (p.class_name ?? '—') }}
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-sm text-gray-600">
              {{ p.bmi ? p.bmi.toFixed(1) : '—' }}
            </td>
            <td class="px-4 py-3">
              <span :class="p.is_athlete ? 'badge-good' : 'badge-average'">
                {{ p.is_athlete ? 'Atlet' : 'Siswa' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1.5 justify-end">
                <RouterLink :to="`/participants/${p.id}`" class="act act-primary">Detail</RouterLink>
                <button @click="openEdit(p)" class="act">Edit</button>
                <button @click="handleDelete(p.id)" class="act act-danger">Hapus</button>
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

    <!-- Create/Edit Modal -->
    <BaseModal :show="showForm" :title="editTarget ? 'Edit Peserta' : 'Tambah Peserta'" size="lg" @close="showForm = false">
      <ParticipantForm
        :participant="editTarget"
        :classes="store.classes"
        @saved="showForm = false; load(); toast.success(editTarget ? 'Peserta berhasil diperbarui.' : 'Peserta berhasil ditambahkan.')"
        @cancel="showForm = false"
      />
    </BaseModal>
  </div>
</template>
