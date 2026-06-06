<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToastContainer from '@/components/common/ToastContainer.vue'
</script>

<template>
  <div>
    <RouterView />
    <ToastContainer />
  </div>
</template>
