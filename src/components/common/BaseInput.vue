<script setup lang="ts">
defineProps<{
  modelValue?: string | number | null
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
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
    <input
      :type="type ?? 'text'"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="input-field"
      :class="{ 'border-red-400 focus:ring-red-400 focus:border-red-400': error }"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-gray-500">{{ hint }}</p>
  </div>
</template>
