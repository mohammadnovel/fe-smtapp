import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
}

const toasts = reactive<Toast[]>([])
let counter = 0

export function useToast() {
  function add(type: ToastType, message: string, duration = 3500) {
    const id = ++counter
    toasts.push({ id, type, message })
    setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id: number) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx !== -1) toasts.splice(idx, 1)
  }

  return {
    toasts,
    success: (msg: string, dur?: number) => add('success', msg, dur),
    error:   (msg: string, dur?: number) => add('error',   msg, dur ?? 5000),
    warning: (msg: string, dur?: number) => add('warning', msg, dur),
    info:    (msg: string, dur?: number) => add('info',    msg, dur),
    dismiss,
  }
}
