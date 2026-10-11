<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '@/api/http'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import { useToast } from '@/composables/useToast'

interface Plan {
  id?: number; code: string; name: string; price_monthly: number; price_yearly: number
  max_participants: number | null; max_users: number | null; features: string[]
  is_popular: boolean; sort_order: number; active: boolean
}

const toast   = useToast()
const rows    = ref<Plan[]>([])
const loading = ref(true)
const show    = ref(false)
const saving  = ref(false)
const errors  = ref<Record<string, string>>({})
const form    = ref<Plan>(blank())
const featuresText = ref('')
const unlimited = (n: number | null) => (n === null ? 'Tidak terbatas' : n)
const idr = (n: number) => `IDR ${n.toLocaleString('id-ID')}`

function blank(): Plan {
  return { code: '', name: '', price_monthly: 0, price_yearly: 0, max_participants: null, max_users: null,
           features: [], is_popular: false, sort_order: rows.value.length + 1, active: true }
}

async function load() {
  const { data } = await http.get('/master/plans')
  rows.value = data
  loading.value = false
}
onMounted(load)

function openForm(p?: Plan) {
  form.value = p ? { ...p } : blank()
  featuresText.value = (form.value.features ?? []).join('\n')
  errors.value = {}
  show.value = true
}

// Empty number inputs mean "unlimited"
const num = (v: unknown) => (v === '' || v === null || v === undefined ? null : Number(v))

async function save() {
  saving.value = true
  errors.value = {}
  const payload = {
    ...form.value,
    price_monthly: Number(form.value.price_monthly),
    price_yearly: Number(form.value.price_yearly),
    max_participants: num(form.value.max_participants),
    max_users: num(form.value.max_users),
    features: featuresText.value.split('\n').map(s => s.trim()).filter(Boolean),
  }
  try {
    if (form.value.id) await http.put(`/master/plans/${form.value.id}`, payload)
    else await http.post('/master/plans', payload)
    show.value = false
    toast.success('Paket disimpan.')
    await load()
  } catch (e: any) {
    const errs = e?.response?.data?.errors
    if (errs) Object.entries(errs).forEach(([k, v]) => (errors.value[k] = (v as string[])[0] ?? ""))
    else toast.error(e?.response?.data?.message ?? 'Gagal menyimpan.')
  } finally {
    saving.value = false
  }
}

async function remove(p: Plan) {
  if (!confirm(`Hapus paket "${p.name}"?`)) return
  try {
    await http.delete(`/master/plans/${p.id}`)
    rows.value = rows.value.filter(r => r.id !== p.id)
    toast.success('Paket dihapus.')
  } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Gagal menghapus.') }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <p class="text-sm text-gray-500">Paket yang tampil di halaman Langganan. Harga dalam Rupiah.</p>
      <BaseButton @click="openForm()">+ Tambah Paket</BaseButton>
    </div>

    <div class="table-wrap">
      <table class="min-w-full divide-y divide-gray-100 text-sm">
        <thead class="bg-gray-50 text-left">
          <tr>
            <th class="dt-th">Paket</th><th class="dt-th">Bulanan</th><th class="dt-th">Tahunan</th>
            <th class="dt-th hidden md:table-cell">Peserta</th><th class="dt-th hidden md:table-cell">Pengguna</th>
            <th class="dt-th">Status</th><th class="dt-th" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="loading"><td colspan="7" class="px-4 py-6 text-center text-gray-400">Memuat...</td></tr>
          <tr v-for="p in rows" :key="p.id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <p class="font-semibold text-gray-900">{{ p.name }} <span v-if="p.is_popular" class="badge-good ml-1">Populer</span></p>
              <p class="font-mono text-xs text-gray-400">{{ p.code }}</p>
            </td>
            <td class="px-4 py-3">{{ idr(p.price_monthly) }}</td>
            <td class="px-4 py-3">{{ idr(p.price_yearly) }}</td>
            <td class="px-4 py-3 hidden md:table-cell">{{ unlimited(p.max_participants) }}</td>
            <td class="px-4 py-3 hidden md:table-cell">{{ unlimited(p.max_users) }}</td>
            <td class="px-4 py-3"><span :class="p.active ? 'badge-good' : 'badge-poor'">{{ p.active ? 'Aktif' : 'Nonaktif' }}</span></td>
            <td class="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
              <button @click="openForm(p)" class="act act-primary">Edit</button>
              <button @click="remove(p)" class="act act-danger">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BaseModal :show="show" :title="form.id ? 'Edit Paket' : 'Tambah Paket'" size="lg" @close="show = false">
      <form @submit.prevent="save" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.code" label="Kode" required :error="errors.code" placeholder="starter" />
          <BaseInput v-model="form.name" label="Nama Paket" required :error="errors.name" />
          <BaseInput v-model="form.price_monthly" type="number" label="Harga Bulanan" required :error="errors.price_monthly" />
          <BaseInput v-model="form.price_yearly" type="number" label="Harga Tahunan" required :error="errors.price_yearly" />
          <BaseInput v-model="form.max_participants" type="number" label="Maks. Peserta (kosong = tak terbatas)" :error="errors.max_participants" />
          <BaseInput v-model="form.max_users" type="number" label="Maks. Pengguna (kosong = tak terbatas)" :error="errors.max_users" />
          <BaseInput v-model="form.sort_order" type="number" label="Urutan" :error="errors.sort_order" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fitur (satu per baris)</label>
          <textarea v-model="featuresText" rows="4" class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div class="flex gap-6">
          <label class="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" v-model="form.is_popular" class="rounded border-gray-300" /> Paling populer</label>
          <label class="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" v-model="form.active" class="rounded border-gray-300" /> Aktif</label>
        </div>
        <div class="flex justify-end gap-3">
          <BaseButton variant="secondary" @click="show = false">Batal</BaseButton>
          <BaseButton type="submit" :loading="saving">Simpan</BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
