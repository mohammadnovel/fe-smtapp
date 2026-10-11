<script setup lang="ts">
import PageHeader from '@/components/common/PageHeader.vue'
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSessionsStore } from '@/stores/sessions'
import { participantsApi } from '@/api/participants'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import AlertBanner from '@/components/common/AlertBanner.vue'

const router = useRouter()
const route  = useRoute()
const store  = useSessionsStore()

const participants = ref<any[]>([])
const loading      = ref(false)
const error        = ref('')

const form = ref({
  participant_id: route.query.participant ? String(route.query.participant) : '',
  academic_year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  semester: new Date().getMonth() < 7 ? '2' : '1',
  test_date: new Date().toISOString().split('T')[0],
  location: '',
})

const semesterOptions = [
  { value: '1', label: 'Semester 1 (Jul–Des)' },
  { value: '2', label: 'Semester 2 (Jan–Jun)' },
]

onMounted(async () => {
  const { data } = await participantsApi.list({ per_page: 500 })
  participants.value = data.data
})

const participantOptions = () => participants.value.map(p => ({
  value: p.id,
  label: `${p.full_name} — ${p.is_athlete ? p.sport_branch : p.class_name ?? 'Siswa'}`,
}))

async function submit() {
  error.value   = ''
  loading.value = true
  try {
    const session = await store.createSession(form.value)
    router.push(`/sessions/${session.id}/input`)
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? 'Gagal membuat sesi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto space-y-5">
    <PageHeader title="Sesi tes baru" subtitle="Buat sesi tes untuk satu peserta" />

    <div class="card space-y-4">
      <AlertBanner v-if="error" type="error" dismissable @dismiss="error = ''">{{ error }}</AlertBanner>

      <form @submit.prevent="submit" class="space-y-4">
        <BaseSelect
          v-model="form.participant_id"
          label="Peserta"
          :options="participantOptions()"
          placeholder="Pilih peserta…"
          required
        />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="form.academic_year" label="Tahun Akademik" placeholder="2025/2026" required />
          <BaseSelect v-model="form.semester" label="Semester" :options="semesterOptions" required />
        </div>
        <BaseInput v-model="form.test_date" label="Tanggal Tes" type="date" required />
        <BaseInput v-model="form.location" label="Lokasi" placeholder="GOR Sekolah" />

        <div class="flex justify-end gap-3 pt-2">
          <BaseButton variant="secondary" @click="router.back()">Batal</BaseButton>
          <BaseButton type="submit" :loading="loading">Buat Sesi & Mulai Input</BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>
