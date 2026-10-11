<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import GencodeTab from './GencodeTab.vue'
import PlanTab from './PlanTab.vue'
import RoleAccessTab from './RoleAccessTab.vue'

const tabs = [
  { key: 'plans',   label: 'Paket Langganan', comp: PlanTab },
  { key: 'roles',   label: 'Peran & Akses Menu', comp: RoleAccessTab },
  { key: 'gencode', label: 'Gencode', comp: GencodeTab },
]
const active = ref('plans')
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Master data" subtitle="Konfigurasi sistem yang hanya bisa diubah super admin" />

    <div class="flex gap-1 border-b border-gray-200 overflow-x-auto">
      <button v-for="t in tabs" :key="t.key" @click="active = t.key"
        :class="['px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
          active === t.key ? 'border-primary-600 text-primary-700' : 'border-transparent text-gray-500 hover:text-gray-700']">
        {{ t.label }}
      </button>
    </div>

    <template v-for="t in tabs" :key="t.key">
      <component :is="t.comp" v-if="active === t.key" />
    </template>
  </div>
</template>
