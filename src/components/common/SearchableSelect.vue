<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option {
  value: string | number
  label: string
}

const props = defineProps<{
  modelValue: string | number
  options: Option[]
  placeholder?: string
  label?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [v: string | number] }>()

const open  = ref(false)
const query = ref('')
const root  = ref<HTMLElement>()

const filtered = computed(() =>
  query.value
    ? props.options.filter(o => o.label.toLowerCase().includes(query.value.toLowerCase()))
    : props.options
)

const selectedLabel = computed(
  () => props.options.find(o => o.value === props.modelValue)?.label ?? props.placeholder ?? '— Pilih —'
)

function select(val: string | number) {
  emit('update:modelValue', val)
  open.value = false
  query.value = ''
}

function toggle() {
  open.value = !open.value
  if (open.value) query.value = ''
}

function onOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}

onMounted(()  => document.addEventListener('mousedown', onOutside))
onUnmounted(() => document.removeEventListener('mousedown', onOutside))
</script>

<template>
  <div ref="root" class="relative">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>

    <!-- Trigger button -->
    <button
      type="button"
      @click="toggle"
      :class="[
        'w-full flex items-center justify-between gap-2 rounded border px-3 py-2 text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
        open ? 'border-primary-500 ring-2 ring-primary-500 bg-white' : 'border-gray-300 bg-white hover:border-primary-400',
      ]"
    >
      <span :class="modelValue !== '' ? 'text-gray-900' : 'text-gray-400'">{{ selectedLabel }}</span>
      <svg :class="['h-4 w-4 text-gray-400 flex-shrink-0 transition-transform', open ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-from-class="opacity-0 scale-95"
      enter-active-class="transition duration-100 ease-out origin-top"
      leave-active-class="transition duration-75 ease-in origin-top"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="open" class="absolute z-50 mt-1 w-full min-w-[180px] rounded-md border border-gray-200 bg-white shadow-lg">
        <!-- Search box -->
        <div class="p-2 border-b border-gray-100">
          <input
            v-model="query"
            type="text"
            placeholder="Ketik untuk cari..."
            autofocus
            class="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            @click.stop
          />
        </div>
        <!-- Options list -->
        <ul class="max-h-48 overflow-y-auto py-1">
          <li
            v-for="opt in filtered"
            :key="opt.value"
            @click="select(opt.value)"
            :class="[
              'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors',
              opt.value === modelValue
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            <svg v-if="opt.value === modelValue" class="h-3.5 w-3.5 text-primary-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <span v-else class="h-3.5 w-3.5 flex-shrink-0" />
            {{ opt.label }}
          </li>
          <li v-if="filtered.length === 0" class="px-3 py-3 text-sm text-gray-400 text-center">
            Tidak ditemukan
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>
