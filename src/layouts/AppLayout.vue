<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'
import SubscriptionBanner from '@/components/layout/SubscriptionBanner.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const sidebarOpen = ref(false)
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <AppTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Subscription banner -->
      <SubscriptionBanner v-if="auth.school" :school="auth.school" />

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>
