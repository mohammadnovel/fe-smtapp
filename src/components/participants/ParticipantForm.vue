<script setup lang="ts">
import { ref, watch } from 'vue'
import { useParticipantsStore } from '@/stores/participants'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps<{
  participant?: any
  classes?: string[]
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancel'): void
}>()

const store = useParticipantsStore()

const form = ref({
  full_name: '', date_of_birth: '', gender: 'male' as 'male' | 'female',
  class_name: '', sport_branch: '', is_athlete: false,
  weight_kg: '', height_cm: '',
})

const loading = ref(false)
const errors  = ref<Record<string, string>>({})

watch(() => props.participant, (p) => {
  if (p) {
    form.value = {
      full_name:    p.full_name ?? '',
      date_of_birth: p.date_of_birth ?? '',
      gender:       p.gender ?? 'male',
      class_name:   p.class_name ?? '',
      sport_branch: p.sport_branch ?? '',
      is_athlete:   p.is_athlete ?? false,
      weight_kg:    p.weight_kg ?? '',
      height_cm:    p.height_cm ?? '',
    }
  }
}, { immediate: true })

const genderOptions = [
  { value: 'male',   label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
]

async function submit() {
  errors.value  = {}
  loading.value = true
  try {
    const payload = {
      ...form.value,
      is_athlete: Boolean(form.value.is_athlete),
      weight_kg:  form.value.weight_kg ? Number(form.value.weight_kg) : undefined,
      height_cm:  form.value.height_cm ? Number(form.value.height_cm) : undefined,
    }
    if (props.participant) {
      await store.updateParticipant(props.participant.id, payload as any)
    } else {
      await store.createParticipant(payload as any)
    }
    emit('saved')
  } catch (e: any) {
    if (e?.response?.data?.errors) {
      Object.entries(e.response.data.errors).forEach(([k, v]) => {
        errors.value[k] = (v as string[])[0]
      })
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div class="col-span-2">
        <BaseInput v-model="form.full_name" label="Nama Lengkap" required :error="errors.full_name" />
      </div>
      <BaseSelect v-model="form.gender" label="Jenis Kelamin" :options="genderOptions" required />
      <BaseInput v-model="form.date_of_birth" label="Tanggal Lahir" type="date" :error="errors.date_of_birth" />
    </div>

    <!-- Type toggle -->
    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" v-model="form.is_athlete" class="h-4 w-4 text-primary-600 rounded" />
        <span class="text-sm font-medium text-gray-700">Atlet (bukan siswa PJOK biasa)</span>
      </label>
    </div>

    <BaseInput
      v-if="!form.is_athlete"
      v-model="form.class_name"
      label="Kelas"
      placeholder="X-A, XI-IPA-1, …"
      :error="errors.class_name"
    />
    <BaseInput
      v-else
      v-model="form.sport_branch"
      label="Cabang Olahraga"
      placeholder="Badminton, Renang, …"
      :error="errors.sport_branch"
    />

    <div class="grid grid-cols-2 gap-4">
      <BaseInput v-model="form.weight_kg" label="Berat (kg)" type="number" placeholder="65" />
      <BaseInput v-model="form.height_cm" label="Tinggi (cm)" type="number" placeholder="170" />
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <BaseButton variant="secondary" @click="emit('cancel')">Batal</BaseButton>
      <BaseButton type="submit" :loading="loading">
        {{ participant ? 'Simpan Perubahan' : 'Tambah Peserta' }}
      </BaseButton>
    </div>
  </form>
</template>
