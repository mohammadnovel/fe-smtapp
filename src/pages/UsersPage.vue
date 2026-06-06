<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import http from '@/api/http'
import DataTable, { type DtColumn } from '@/components/common/DataTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { useToast } from '@/composables/useToast'
import { formatDateTime } from '@/utils/date'

const toast    = useToast()
const rawUsers = ref<any[]>([])
const loading  = ref(true)
const showForm = ref(false)
const saving   = ref(false)
const formErrors = ref<Record<string, string>>({})
const form     = ref({ name: '', email: '', role: 'teacher' })

const roleFilter = ref('')

const roleFilterOptions = [
  { value: '',              label: 'Semua Peran' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'teacher',       label: 'Guru PJOK' },
  { value: 'coach',         label: 'Pelatih' },
]
const roleOptions = [
  { value: 'teacher', label: 'Guru PJOK' },
  { value: 'coach',   label: 'Pelatih' },
]

const tableData = computed(() =>
  roleFilter.value
    ? rawUsers.value.filter(u => u.role === roleFilter.value)
    : rawUsers.value
)

const columns: DtColumn[] = [
  { key: 'name',       label: 'Nama' },
  { key: 'email',      label: 'Email',  class: 'hidden sm:table-cell' },
  { key: 'role_label', label: 'Peran' },
  { key: 'status',     label: 'Status' },
  { key: 'actions',    label: '',       sortable: false },
]

function roleLabel(role: string) {
  return role === 'administrator' ? 'Admin' : role === 'teacher' ? 'Guru PJOK' : 'Pelatih'
}

onMounted(async () => {
  const { data } = await http.get('/users')
  rawUsers.value = (data as any[]).map(u => ({ ...u, role_label: roleLabel(u.role) }))
  loading.value  = false
})

async function submit() {
  saving.value   = true
  formErrors.value = {}
  try {
    const { data } = await http.post('/users', form.value)
    rawUsers.value.push({ ...data, role_label: roleLabel(data.role) })
    showForm.value = false
    form.value     = { name: '', email: '', role: 'teacher' }
    toast.success('Pengguna berhasil ditambahkan.')
  } catch (e: any) {
    if (e?.response?.data?.errors) {
      Object.entries(e.response.data.errors).forEach(([k, v]) => {
        formErrors.value[k] = (v as string[])[0]
      })
    } else {
      toast.error(e?.response?.data?.message ?? 'Gagal menambahkan pengguna.')
    }
  } finally {
    saving.value = false
  }
}

async function toggleActive(user: any) {
  const label = user.is_active ? 'nonaktifkan' : 'aktifkan'
  if (!confirm(`Yakin ${label} pengguna "${user.name}"?`)) return
  try {
    const { data } = await http.post(`/users/${user.id}/toggle-active`)
    const idx = rawUsers.value.findIndex(u => u.id === user.id)
    if (idx !== -1) rawUsers.value[idx] = { ...data, role_label: roleLabel(data.role) }
    toast.success(`Pengguna berhasil di${label}kan.`)
  } catch {
    toast.error('Gagal mengubah status pengguna.')
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pengguna</h1>
        <p class="text-sm text-gray-500">Kelola guru dan pelatih sekolah ({{ rawUsers.length }} pengguna)</p>
      </div>
      <BaseButton @click="showForm = true">+ Undang Pengguna</BaseButton>
    </div>

    <!-- Role filter chips -->
    <div class="flex items-center gap-2 flex-wrap">
      <button
        v-for="opt in roleFilterOptions"
        :key="opt.value"
        @click="roleFilter = opt.value"
        :class="[
          'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
          roleFilter === opt.value
            ? 'bg-primary-600 border-primary-600 text-white'
            : 'bg-white border-gray-300 text-gray-600 hover:border-primary-400 hover:text-primary-600',
        ]"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- DataTable -->
    <DataTable :columns="columns" :data="tableData" :loading="loading" empty-message="Tidak ada pengguna ditemukan.">
      <template #default="{ rows }">
        <tr v-for="u in rows" :key="u.id" class="hover:bg-gray-50 transition-colors">
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                :class="u.role === 'administrator' ? 'bg-purple-100 text-purple-700' : u.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'"
              >
                {{ u.name.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-medium text-sm text-gray-900">{{ u.name }}</p>
                <p class="text-xs text-gray-400">Bergabung {{ formatDateTime(u.created_at) }}</p>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 hidden sm:table-cell text-sm text-gray-500">{{ u.email }}</td>
          <td class="px-4 py-3">
            <span :class="u.role === 'administrator' ? 'badge-excellent' : u.role === 'teacher' ? 'badge-good' : 'badge-average'">
              {{ u.role_label }}
            </span>
          </td>
          <td class="px-4 py-3">
            <span :class="u.is_active ? 'badge-good' : 'badge-poor'">
              {{ u.is_active ? 'Aktif' : 'Nonaktif' }}
            </span>
          </td>
          <td class="px-4 py-3 text-right">
            <button
              v-if="u.role !== 'administrator'"
              @click="toggleActive(u)"
              :class="['text-xs font-medium hover:underline', u.is_active ? 'text-amber-600' : 'text-emerald-600']"
            >
              {{ u.is_active ? 'Nonaktifkan' : 'Aktifkan' }}
            </button>
          </td>
        </tr>
      </template>
    </DataTable>

    <!-- Invite Modal -->
    <BaseModal :show="showForm" title="Undang Pengguna" @close="showForm = false; formErrors = {}">
      <form @submit.prevent="submit" class="space-y-4">
        <BaseInput v-model="form.name"  label="Nama Lengkap" required :error="formErrors.name" />
        <BaseInput v-model="form.email" label="Alamat Email" type="email" required :error="formErrors.email" />
        <BaseSelect v-model="form.role" label="Peran" :options="roleOptions" />
        <p class="text-xs text-gray-500 bg-gray-50 rounded p-3">
          Pengguna akan ditambahkan langsung dengan password default <strong>password</strong> dan dapat mengubahnya setelah login pertama.
        </p>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="showForm = false">Batal</BaseButton>
          <BaseButton type="submit" :loading="saving">Tambahkan</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
