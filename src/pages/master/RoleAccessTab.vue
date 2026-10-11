<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/api/http'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { useToast } from '@/composables/useToast'

interface RoleRow {
  id: number; code: string; label: string; base_role: string
  is_system: boolean; active: boolean; menus: string[]; users: number
}
interface MenuRow { id: number; code: string; label: string; path: string; active: boolean }

const toast   = useToast()
const roles   = ref<RoleRow[]>([])
const menus   = ref<MenuRow[]>([])
const loading = ref(true)
const savingRole = ref<string | null>(null)

const showForm = ref(false)
const creating = ref(false)
const errors   = ref<Record<string, string>>({})
const form     = ref({ code: '', label: '', base_role: 'teacher' })
const baseOptions = [
  { value: 'teacher', label: 'Seperti Guru PJOK (data peserta non-atlet)' },
  { value: 'coach',   label: 'Seperti Pelatih (data atlet, benchmark kustom)' },
]
const baseLabel = (b: string) => ({ administrator: 'Administrator', teacher: 'Guru PJOK', coach: 'Pelatih' }[b] ?? b)

async function load() {
  const { data } = await http.get('/master/role-access')
  roles.value = data.roles
  menus.value = data.menus
  loading.value = false
}
onMounted(load)

function toggle(r: RoleRow, code: string) {
  if (code === 'dashboard') return // landing page, always allowed
  r.menus = r.menus.includes(code) ? r.menus.filter(c => c !== code) : [...r.menus, code]
}

async function save(r: RoleRow) {
  savingRole.value = r.code
  try {
    await http.put(`/master/role-access/${r.code}`, { menus: r.menus })
    toast.success(`Akses menu ${r.label} disimpan. Berlaku setelah pengguna memuat ulang.`)
  } catch (e: any) {
    toast.error(e?.response?.data?.message ?? 'Gagal menyimpan.')
  } finally {
    savingRole.value = null
  }
}

async function createRole() {
  creating.value = true
  errors.value = {}
  try {
    await http.post('/master/roles', form.value)
    showForm.value = false
    form.value = { code: '', label: '', base_role: 'teacher' }
    toast.success('Peran ditambahkan. Atur menunya lalu simpan.')
    await load()
  } catch (e: any) {
    const errs = e?.response?.data?.errors
    if (errs) Object.entries(errs).forEach(([k, v]) => (errors.value[k] = (v as string[])[0] ?? ''))
    else toast.error(e?.response?.data?.message ?? 'Gagal menambah peran.')
  } finally {
    creating.value = false
  }
}

async function rename(r: RoleRow) {
  const label = prompt('Nama peran', r.label)?.trim()
  if (!label || label === r.label) return
  try {
    await http.put(`/master/roles/${r.id}`, { label, active: r.active })
    r.label = label
  } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Gagal mengubah nama.') }
}

async function toggleActive(r: RoleRow) {
  try {
    await http.put(`/master/roles/${r.id}`, { label: r.label, active: !r.active })
    r.active = !r.active
  } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Gagal mengubah status.') }
}

async function remove(r: RoleRow) {
  if (!confirm(`Hapus peran "${r.label}"?`)) return
  try {
    await http.delete(`/master/roles/${r.id}`)
    roles.value = roles.value.filter(x => x.id !== r.id)
    toast.success('Peran dihapus.')
  } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Gagal menghapus.') }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-gray-500">Centang menu yang boleh dibuka tiap peran. Super admin selalu punya akses ke semua menu.</p>
      <BaseButton @click="showForm = true">+ Tambah Peran</BaseButton>
    </div>

    <div v-if="loading" class="text-center text-gray-400 py-6">Memuat...</div>
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div v-for="r in roles" :key="r.code" :class="['card space-y-3', r.active ? '' : 'opacity-60']">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-semibold text-gray-900">{{ r.label }}</h3>
            <p class="text-xs text-gray-400">
              <span class="font-mono">{{ r.code }}</span> · {{ r.users }} pengguna
              <template v-if="!r.is_system"> · {{ baseLabel(r.base_role) }}</template>
            </p>
          </div>
          <span v-if="r.is_system" class="badge-average">Sistem</span>
          <span v-else-if="!r.active" class="badge-poor">Nonaktif</span>
        </div>
        <ul class="space-y-1">
          <li v-for="m in menus" :key="m.code">
            <label class="flex items-center gap-2 text-sm py-1" :class="m.active ? 'text-gray-700' : 'text-gray-400'">
              <input type="checkbox" class="rounded border-gray-300"
                :checked="r.menus.includes(m.code)" :disabled="m.code === 'dashboard'"
                @change="toggle(r, m.code)" />
              {{ m.label }} <span class="font-mono text-xs text-gray-400">{{ m.path }}</span>
            </label>
          </li>
        </ul>
        <BaseButton class="w-full" :loading="savingRole === r.code" @click="save(r)">Simpan Akses</BaseButton>
        <div class="flex justify-between text-xs font-medium">
          <button @click="rename(r)" class="text-primary-600 hover:underline">Ubah nama</button>
          <template v-if="!r.is_system">
            <button @click="toggleActive(r)" class="text-amber-600 hover:underline">{{ r.active ? 'Nonaktifkan' : 'Aktifkan' }}</button>
            <button @click="remove(r)" class="text-red-600 hover:underline">Hapus</button>
          </template>
        </div>
      </div>
    </div>

    <BaseModal :show="showForm" title="Tambah Peran" @close="showForm = false">
      <form @submit.prevent="createRole" class="space-y-4">
        <BaseInput v-model="form.code" label="Kode" required :error="errors.code" placeholder="analyst" />
        <BaseInput v-model="form.label" label="Nama Peran" required :error="errors.label" />
        <BaseSelect v-model="form.base_role" label="Aturan data mengikuti" :options="baseOptions" />
        <p class="text-xs text-gray-500 bg-gray-50 rounded p-3">
          Aturan data menentukan peserta mana yang bisa dilihat dan diubah. Menu yang bisa dibuka diatur setelah peran dibuat.
        </p>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="showForm = false">Batal</BaseButton>
          <BaseButton type="submit" :loading="creating">Tambahkan</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
