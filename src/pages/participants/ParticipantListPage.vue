<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useParticipantsStore } from '@/stores/participants'
import BaseButton from '@/components/common/BaseButton.vue'
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

async function handleDelete(id: number) {
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
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Peserta</h1>
        <p class="text-sm text-gray-500">{{ store.pagination.total }} peserta terdaftar</p>
      </div>
      <BaseButton @click="openCreate">+ Tambah Peserta</BaseButton>
    </div>

    <!-- DataTable top bar -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <!-- Left: entries + filters -->
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-sm text-gray-600">Tampilkan</span>
        <select
          v-model="perPage"
          class="rounded border border-gray-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="n in perOptions" :key="n" :value="n">{{ n }}</option>
        </select>
        <span class="text-sm text-gray-600">entri</span>
        <select
          v-model="gender"
          class="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="o in genderOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
        <select
          v-model="isAthlete"
          class="rounded border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option v-for="o in athleteOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </div>
      <!-- Right: search -->
      <div class="relative">
        <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="search" type="search" placeholder="Cari nama…"
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
              :class="['px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider select-none', col.class, col.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : '']"
              @click="col.sortable !== false && toggleSort(col.key)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <span v-if="col.sortable !== false" class="inline-flex flex-col gap-0">
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
          <tr v-else-if="sortedParticipants.length === 0">
            <td :colspan="columns.length" class="px-4 py-12 text-center text-gray-400 text-sm">
              {{ search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada peserta.' }}
            </td>
          </tr>
          <tr v-for="p in sortedParticipants" v-else :key="p.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="h-9 w-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-sm font-bold flex-shrink-0">
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
              <div class="flex items-center gap-3 justify-end">
                <RouterLink :to="`/participants/${p.id}`" class="text-xs text-primary-600 hover:underline font-medium">Detail</RouterLink>
                <button @click="openEdit(p)" class="text-xs text-gray-500 hover:text-gray-700">Edit</button>
                <button @click="handleDelete(p.id)" class="text-xs text-red-500 hover:text-red-700">Hapus</button>
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
