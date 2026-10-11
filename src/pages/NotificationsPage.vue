<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import http from '@/api/http'
import DataTable, { type DtColumn } from '@/components/common/DataTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import { formatDateTime } from '@/utils/date'

const rawData   = ref<any[]>([])
const loading   = ref(true)
const typeFilter = ref('')

const typeOptions = [
  { value: '',             label: 'Semua Tipe' },
  { value: 'trial',        label: 'Trial' },
  { value: 'session',      label: 'Sesi Tes' },
  { value: 'system',       label: 'Sistem' },
  { value: 'subscription', label: 'Langganan' },
]

const tableData = computed(() =>
  typeFilter.value ? rawData.value.filter(n => n.type === typeFilter.value) : rawData.value
)

const unreadCount = computed(() => rawData.value.filter(n => !n.is_read).length)

const columns: DtColumn[] = [
  { key: 'type_label', label: 'Tipe',    class: 'hidden sm:table-cell', sortable: true },
  { key: 'title',      label: 'Judul',   sortable: true },
  { key: 'message',    label: 'Pesan',   class: 'hidden md:table-cell', sortable: false },
  { key: 'time',       label: 'Waktu',   sortable: true },
  { key: 'status',     label: 'Status',  sortable: true },
  { key: 'actions',    label: '',        sortable: false },
]

const typeColors: Record<string, string> = {
  trial:        'bg-purple-100 text-purple-700',
  session:      'bg-blue-100 text-blue-700',
  system:       'bg-gray-100 text-gray-700',
  subscription: 'bg-amber-100 text-amber-700',
}
const typeLabels: Record<string, string> = {
  trial: 'Trial', session: 'Sesi', system: 'Sistem', subscription: 'Langganan',
}

async function load() {
  loading.value = true
  try {
    const { data } = await http.get('/notifications', { params: { per_page: 100 } })
    rawData.value = (data.data as any[]).map(n => ({
      ...n,
      type_label: typeLabels[n.type] ?? n.type,
      time: formatDateTime(n.created_at),
    }))
  } finally {
    loading.value = false
  }
}

async function markAll() {
  await http.post('/notifications/mark-all-read')
  rawData.value.forEach(n => { n.is_read = true })
}

async function markRead(n: any) {
  if (n.is_read) return
  await http.post(`/notifications/${n.id}/read`)
  n.is_read = true
}

onMounted(load)
</script>

<template>
  <div class="space-y-5">
    <PageHeader title="Notifikasi">
      <template #subtitle>
        {{ rawData.length }} notifikasi
        <span v-if="unreadCount" class="ml-1 rounded-md bg-red-100 px-1.5 py-0.5 text-xs font-semibold text-red-700">{{ unreadCount }} belum dibaca</span>
      </template>
      <BaseButton variant="secondary" @click="markAll">Tandai semua dibaca</BaseButton>
    </PageHeader>

    <div class="seg flex-wrap self-start" role="group" aria-label="Filter jenis">
      <button v-for="opt in typeOptions" :key="opt.value" @click="typeFilter = opt.value"
        :aria-pressed="typeFilter === opt.value"
        :class="['seg-btn', typeFilter === opt.value ? 'seg-btn-on' : '']">{{ opt.label }}</button>
    </div>

    <!-- DataTable -->
    <DataTable :columns="columns" :data="tableData" :loading="loading" empty-message="Tidak ada notifikasi.">
      <template #default="{ rows }">
        <tr
          v-for="n in rows"
          :key="n.id"
          @click="markRead(n)"
          :class="['cursor-pointer transition-colors', n.is_read ? 'hover:bg-gray-50' : 'bg-primary-50/40 hover:bg-primary-50']"
        >
          <td class="px-4 py-3 hidden sm:table-cell">
            <span :class="['inline-flex px-2 py-0.5 rounded-md text-xs font-semibold', typeColors[n.type] ?? 'bg-gray-100 text-gray-700']">
              {{ n.type_label }}
            </span>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-2">
              <span :class="['h-2 w-2 rounded-full flex-shrink-0', n.is_read ? 'bg-gray-300' : 'bg-primary-500']" />
              <span class="text-sm font-medium text-gray-900">{{ n.title }}</span>
            </div>
          </td>
          <td class="px-4 py-3 hidden md:table-cell">
            <p class="text-sm text-gray-500 max-w-xs truncate">{{ n.message }}</p>
          </td>
          <td class="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{{ n.time }}</td>
          <td class="px-4 py-3">
            <span :class="n.is_read ? 'badge-average' : 'badge-good'">
              {{ n.is_read ? 'Dibaca' : 'Baru' }}
            </span>
          </td>
          <td class="px-4 py-3 text-right">
            <button
              v-if="!n.is_read"
              @click.stop="markRead(n)"
              class="act act-primary"
            >Tandai dibaca</button>
          </td>
        </tr>
      </template>
    </DataTable>
  </div>
</template>
