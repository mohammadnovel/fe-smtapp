<script setup lang="ts">
defineProps<{
  modelValue?: string | number | null
  label?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
}>()

defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <select
      :value="modelValue ?? ''"
      :disabled="disabled"
      :required="required"
      class="input-field"
      :class="{ 'border-red-400': error }"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </div>
</template>
