<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { benchmarksApi } from '@/api/benchmarks'
import { useAuthStore } from '@/stores/auth'
import DataTable, { type DtColumn } from '@/components/common/DataTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import SearchableSelect from '@/components/common/SearchableSelect.vue'
import { useToast } from '@/composables/useToast'

const toast      = useToast()
const auth       = useAuthStore()
const allData    = ref<any[]>([])
const loading    = ref(true)
const showForm   = ref(false)
const saving     = ref(false)

// Filter state
const filterComponent = ref('')
const filterItem      = ref('')
const filterGender    = ref('')

const form = ref({
  component: '', test_item: '', gender: 'male',
  sport_branch: '', benchmark_value: '', lower_is_better: false,
})

// ── Derived filter options ──────────────────────────────────────────────────

const componentOptions = computed(() => {
  const unique = [...new Set(allData.value.map(b => b.component))].sort()
  return [
    { value: '', label: 'Semua Komponen' },
    ...unique.map(c => ({ value: c, label: c })),
  ]
})

const itemOptions = computed(() => {
  const source = filterComponent.value
    ? allData.value.filter(b => b.component === filterComponent.value)
    : allData.value
  const unique = [...new Set(source.map(b => b.test_item))].sort()
  return [
    { value: '', label: 'Semua Item Tes' },
    ...unique.map(i => ({ value: i, label: i })),
  ]
})

const genderOptions = [
  { value: '',       label: 'Semua Gender' },
  { value: 'male',   label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
]

const formGenderOptions = [
  { value: 'male',   label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
]

// ── Filtered table data ─────────────────────────────────────────────────────

const tableData = computed(() =>
  allData.value.filter(b => {
    if (filterComponent.value && b.component !== filterComponent.value) return false
    if (filterItem.value      && b.test_item  !== filterItem.value)      return false
    if (filterGender.value    && b.gender     !== filterGender.value)    return false
    return true
  })
)

// ── Columns ─────────────────────────────────────────────────────────────────

const columns = computed<DtColumn[]>(() => [
  { key: 'component',       label: 'Komponen' },
  { key: 'test_item',       label: 'Item Tes' },
  { key: 'gender_label',    label: 'Gender',   class: 'hidden sm:table-cell' },
  { key: 'benchmark_value', label: 'Nilai Acuan' },
  { key: 'source_label',    label: 'Sumber',   class: 'hidden md:table-cell' },
  ...(auth.isAdmin || auth.isCoach ? [{ key: 'actions', label: '', sortable: false }] : []),
])

// ── Load ─────────────────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    const { data } = await benchmarksApi.list()
    allData.value = (data as any[]).map(b => ({
      ...b,
      gender_label: b.gender === 'male' ? 'Laki-laki' : 'Perempuan',
      source_label: b.source ?? '—',
    }))
  } finally {
    loading.value = false
  }
})

function resetItemFilter() { filterItem.value = '' }

// ── Submit / Delete ──────────────────────────────────────────────────────────

async function submit() {
  saving.value = true
  try {
    await benchmarksApi.create({
      ...form.value,
      benchmark_value: parseFloat(form.value.benchmark_value),
      lower_is_better: Boolean(form.value.lower_is_better),
    })
    const { data } = await benchmarksApi.list()
    allData.value = (data as any[]).map(b => ({
      ...b,
      gender_label: b.gender === 'male' ? 'Laki-laki' : 'Perempuan',
      source_label: b.source ?? '—',
    }))
    showForm.value = false
    form.value = { component: '', test_item: '', gender: 'male', sport_branch: '', benchmark_value: '', lower_is_better: false }
    toast.success('Benchmark kustom berhasil ditambahkan.')
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Gagal menyimpan benchmark.')
  } finally {
    saving.value = false
  }
}

async function deleteBenchmark(id: string) {
  if (!confirm('Hapus benchmark kustom ini?')) return
  try {
    await benchmarksApi.delete(id)
    allData.value = allData.value.filter(b => b.id !== id)
    toast.success('Benchmark berhasil dihapus.')
  } catch {
    toast.error('Gagal menghapus benchmark.')
  }
}
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Benchmark" :subtitle="`Nilai acuan Asian Benchmark dan kustom sekolah, ${allData.length} total`">
      <BaseButton v-if="auth.isAdmin || auth.isCoach" @click="showForm = true">+ Tambah Kustom</BaseButton>
    </PageHeader>

    <!-- Filter row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <SearchableSelect
        v-model="filterComponent"
        :options="componentOptions"
        placeholder="Semua Komponen"
        @update:model-value="resetItemFilter"
      />
      <SearchableSelect
        v-model="filterItem"
        :options="itemOptions"
        placeholder="Semua Item Tes"
      />
      <select
        v-model="filterGender"
        class="field-select"
      >
        <option v-for="opt in genderOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>

    <!-- Active filter pills -->
    <div v-if="filterComponent || filterItem || filterGender" class="flex flex-wrap gap-2">
      <span class="text-xs text-gray-500">Filter aktif:</span>
      <button
        v-if="filterComponent"
        @click="filterComponent = ''; resetItemFilter()"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-100 text-primary-700 text-xs hover:bg-primary-200"
      >
        {{ filterComponent }}
        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      <button
        v-if="filterItem"
        @click="filterItem = ''"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs hover:bg-blue-200"
      >
        {{ filterItem }}
        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      <button
        v-if="filterGender"
        @click="filterGender = ''"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs hover:bg-emerald-200"
      >
        {{ filterGender === 'male' ? 'Laki-laki' : 'Perempuan' }}
        <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      <button @click="filterComponent = ''; filterItem = ''; filterGender = ''" class="text-xs text-red-500 hover:underline ml-1">Reset semua</button>
    </div>

    <!-- DataTable -->
    <DataTable :columns="columns" :data="tableData" :loading="loading" empty-message="Tidak ada benchmark yang sesuai filter.">
      <template #default="{ rows }">
        <tr
          v-for="b in rows"
          :key="b.id"
          :class="['hover:bg-gray-50 transition-colors', b.school_id ? 'bg-amber-50/30' : '']"
        >
          <td class="px-4 py-3">
            <span class="inline-flex items-center gap-1.5">
              <span v-if="b.school_id" class="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Kustom sekolah" />
              <span class="text-sm font-medium text-gray-700">{{ b.component }}</span>
            </span>
          </td>
          <td class="px-4 py-3 text-sm text-gray-900">{{ b.test_item }}</td>
          <td class="px-4 py-3 hidden sm:table-cell">
            <span :class="b.gender === 'male' ? 'badge-average' : 'badge-good'">
              {{ b.gender_label }}
            </span>
          </td>
          <td class="px-4 py-3">
            <span class="text-sm font-semibold text-gray-900">{{ b.benchmark_value }}</span>
            <span v-if="b.lower_is_better" class="ml-1 text-xs text-amber-600" title="Lebih rendah lebih baik">↓</span>
          </td>
          <td class="px-4 py-3 hidden md:table-cell">
            <span :class="b.school_id ? 'badge-average' : 'badge-good'" class="text-xs">
              {{ b.source_label }}
            </span>
          </td>
          <td v-if="auth.isAdmin || auth.isCoach" class="px-4 py-3 text-right">
            <button
              v-if="b.school_id"
              @click="deleteBenchmark(b.id)"
              class="act act-danger"
            >Hapus</button>
          </td>
        </tr>
      </template>
    </DataTable>

    <!-- Add Modal -->
    <BaseModal :show="showForm" title="Tambah Benchmark Kustom" @close="showForm = false">
      <form @submit.prevent="submit" class="space-y-4">
        <BaseInput v-model="form.component"       label="Komponen"              required />
        <BaseInput v-model="form.test_item"       label="Item Tes"              required />
        <BaseSelect v-model="form.gender"         label="Gender" :options="formGenderOptions" />
        <BaseInput v-model="form.sport_branch"    label="Cabang Olahraga (opsional)" />
        <BaseInput v-model="form.benchmark_value" label="Nilai Benchmark" type="number" step="0.01" required />
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" v-model="form.lower_is_better" class="h-4 w-4 text-primary-600 rounded" />
          <span class="text-sm text-gray-700">Lebih rendah = lebih baik (e.g. waktu lari)</span>
        </label>
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="secondary" @click="showForm = false">Batal</BaseButton>
          <BaseButton type="submit" :loading="saving">Simpan</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
