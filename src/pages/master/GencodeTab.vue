<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/api/http'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { useToast } from '@/composables/useToast'

interface Gencode { id?: number; name: string; value: string; active: boolean; description: string | null }

const toast   = useToast()
const rows    = ref<Gencode[]>([])
const loading = ref(true)
const show    = ref(false)
const saving  = ref(false)
const errors  = ref<Record<string, string>>({})
const form    = ref<Gencode>(blank())

function blank(): Gencode { return { name: '', value: '', active: true, description: '' } }

async function load() {
  const { data } = await http.get('/master/gencodes')
  rows.value = data
  loading.value = false
}
onMounted(load)

function openForm(g?: Gencode) {
  form.value = g ? { ...g } : blank()
  errors.value = {}
  show.value = true
}

async function save() {
  saving.value = true
  errors.value = {}
  try {
    if (form.value.id) await http.put(`/master/gencodes/${form.value.id}`, form.value)
    else await http.post('/master/gencodes', form.value)
    show.value = false
    toast.success('Gencode disimpan.')
    await load()
  } catch (e: any) {
    const errs = e?.response?.data?.errors
    if (errs) Object.entries(errs).forEach(([k, v]) => (errors.value[k] = (v as string[])[0] ?? ""))
    else toast.error(e?.response?.data?.message ?? 'Gagal menyimpan.')
  } finally {
    saving.value = false
  }
}

async function toggle(g: Gencode) {
  try {
    await http.put(`/master/gencodes/${g.id}`, { ...g, active: !g.active })
    g.active = !g.active
  } catch { toast.error('Gagal mengubah status.') }
}

async function remove(g: Gencode) {
  if (!confirm(`Hapus gencode "${g.name}"?`)) return
  try {
    await http.delete(`/master/gencodes/${g.id}`)
    rows.value = rows.value.filter(r => r.id !== g.id)
    toast.success('Gencode dihapus.')
  } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Gagal menghapus.') }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-gray-500">Pengaturan sistem berbasis nama dan nilai, supaya tidak hardcode. Hanya yang aktif yang dipakai.</p>
      <BaseButton @click="openForm()">+ Tambah Gencode</BaseButton>
    </div>

    <div class="table-wrap">
      <table class="min-w-full divide-y divide-gray-100 text-sm">
        <thead class="bg-gray-50 text-left">
          <tr><th class="dt-th">Name</th><th class="dt-th">Value</th><th class="dt-th hidden sm:table-cell">Keterangan</th><th class="dt-th">Status</th><th class="dt-th" /></tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading"><td colspan="5" class="px-4 py-6 text-center text-gray-400">Memuat...</td></tr>
          <tr v-else-if="!rows.length"><td colspan="5" class="px-4 py-6 text-center text-gray-400">Belum ada gencode.</td></tr>
          <tr v-for="g in rows" :key="g.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 font-mono text-xs text-gray-900">{{ g.name }}</td>
            <td class="px-4 py-3 font-semibold">{{ g.value }}</td>
            <td class="px-4 py-3 hidden sm:table-cell text-gray-500">{{ g.description }}</td>
            <td class="px-4 py-3">
              <button @click="toggle(g)" :class="g.active ? 'badge-good' : 'badge-poor'">{{ g.active ? 'Aktif' : 'Nonaktif' }}</button>
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
              <button @click="openForm(g)" class="act act-primary">Edit</button>
              <button @click="remove(g)" class="act act-danger">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :show="show" :title="form.id ? 'Edit Gencode' : 'Tambah Gencode'" @close="show = false">
      <form @submit.prevent="save" class="space-y-4">
        <BaseInput v-model="form.name" label="Name" required :error="errors.name" placeholder="trial_days" />
        <BaseInput v-model="form.value" label="Value" required :error="errors.value" />
        <BaseInput v-model="form.description" label="Keterangan" :error="errors.description" />
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" v-model="form.active" class="rounded border-gray-300" /> Aktif
        </label>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="show = false">Batal</BaseButton>
          <BaseButton type="submit" :loading="saving">Simpan</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
