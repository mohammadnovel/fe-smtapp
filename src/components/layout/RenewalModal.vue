<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'

const auth   = useAuthStore()
const router = useRouter()

const isTrial = computed(() => auth.school?.subscription_plan === 'trial')

const message = computed(() => {
  if (auth.school?.subscription_status === 'past_due') {
    return 'Langganan sekolah Anda sudah jatuh tempo. Lakukan pembayaran untuk membuka kembali akses.'
  }
  return isTrial.value
    ? 'Masa trial sekolah Anda telah berakhir. Pilih paket langganan untuk melanjutkan akses.'
    : 'Langganan sekolah Anda telah berakhir. Perpanjang untuk melanjutkan akses.'
})

function renew() {
  auth.renewalPrompt = false
  router.push({ name: 'billing' })
}
</script>

<template>
  <BaseModal :show="auth.renewalPrompt" title="Perpanjang Langganan" size="sm" @close="auth.renewalPrompt = false">
    <p class="text-sm text-gray-600">{{ message }}</p>
    <p v-if="!auth.isAdmin" class="text-sm text-gray-500 mt-2">
      Hubungi administrator sekolah Anda untuk melakukan perpanjangan.
    </p>
    <template #footer>
      <BaseButton variant="secondary" @click="auth.renewalPrompt = false">Nanti</BaseButton>
      <BaseButton v-if="auth.isAdmin" @click="renew">Perpanjang Sekarang</BaseButton>
    </template>
  </BaseModal>
</template>
