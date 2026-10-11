<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import AlertBanner from '@/components/common/AlertBanner.vue'

const router = useRouter()
const auth   = useAuthStore()

const form = ref({
  school_name: '', school_city: '', school_province: '',
  school_type: '', school_email: '',
  name: '', email: '', password: '', password_confirmation: '',
})
const loading = ref(false)
const errors  = ref<Record<string, string>>({})
const apiError = ref('')

const schoolTypes = [
  { value: 'junior_high', label: 'SMP / MTs' },
  { value: 'senior_high', label: 'SMA / SMK / MA' },
  { value: 'university',  label: 'Perguruan Tinggi' },
  { value: 'club',        label: 'Klub Olahraga' },
]

async function submit() {
  errors.value   = {}
  apiError.value = ''
  loading.value  = true
  try {
    await auth.register(form.value)
    router.push({ name: 'dashboard' })
  } catch (e: any) {
    if (e?.response?.data?.errors) {
      Object.entries(e.response.data.errors).forEach(([k, v]) => {
        errors.value[k] = (v as string[])[0]
      })
    } else {
      apiError.value = e?.response?.data?.message ?? 'Pendaftaran gagal.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-100 flex items-center justify-center p-4">
    <div class="w-full max-w-lg">
      <div class="text-center mb-6">
        <div class="inline-flex items-center justify-center h-12 w-12 bg-primary-600 rounded-xl mb-2">
          <span class="text-white font-bold">SA</span>
        </div>
        <h1 class="text-xl font-bold text-gray-900">Daftar Sekolah — Trial 7 Hari Gratis</h1>
      </div>

      <div class="card">
        <AlertBanner v-if="apiError" type="error" dismissable @dismiss="apiError = ''" class="mb-4">
          {{ apiError }}
        </AlertBanner>

        <form @submit.prevent="submit" class="space-y-4">
          <div class="border-b border-gray-100 pb-4">
            <p class="text-xs font-semibold text-gray-500 uppercase mb-3">Informasi Sekolah</p>
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <BaseInput v-model="form.school_name" label="Nama Sekolah" required :error="errors.school_name" />
              </div>
              <BaseSelect v-model="form.school_type" label="Jenis" :options="schoolTypes" placeholder="Pilih jenis" required :error="errors.school_type" />
              <BaseInput v-model="form.school_email" label="Email Sekolah" type="email" required :error="errors.school_email" />
              <BaseInput v-model="form.school_city"     label="Kota"     :error="errors.school_city" />
              <BaseInput v-model="form.school_province" label="Provinsi" :error="errors.school_province" />
            </div>
          </div>

          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase mb-3">Akun Administrator</p>
            <div class="space-y-3">
              <BaseInput v-model="form.name"  label="Nama"           required :error="errors.name" />
              <BaseInput v-model="form.email" label="Email"  type="email" required :error="errors.email" />
              <BaseInput v-model="form.password"              label="Password"         type="password" required :error="errors.password" />
              <BaseInput v-model="form.password_confirmation" label="Konfirmasi Password" type="password" required />
            </div>
          </div>

          <BaseButton type="submit" class="w-full" :loading="loading" size="lg">
            Daftar & Mulai Trial Gratis
          </BaseButton>
        </form>

        <p class="text-center text-sm text-gray-500 mt-4">
          Sudah punya akun?
          <RouterLink to="/login" class="text-primary-600 hover:underline font-medium">Masuk</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
