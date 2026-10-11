import { ref, computed } from 'vue'
import { Chart } from 'chart.js'

export type ThemeMode = 'light' | 'dark' | 'system'

const KEY = 'theme'

function read(): ThemeMode {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
  } catch {
    return 'system'
  }
}

const mode = ref<ThemeMode>(read())
const systemDark = ref(false)
/** Bumps on every theme change; bind it as :key on charts so they redraw with the new colours */
const themeVersion = ref(0)
const isDark = computed(() => mode.value === 'dark' || (mode.value === 'system' && systemDark.value))

function apply() {
  themeVersion.value++
  document.documentElement.classList.toggle('dark', isDark.value)
  // Chart.js draws on canvas, so it does not follow CSS: give it matching text and grid colours
  Chart.defaults.color = isDark.value ? '#a8afba' : '#6b7280'
  Chart.defaults.borderColor = isDark.value ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  // radar tick labels sit on a white backdrop by default, which glares on dark surfaces
  const radial = Chart.defaults.scales.radialLinear
  if (radial?.ticks) radial.ticks.backdropColor = isDark.value ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.75)'
}

let started = false

/** Call once at startup: follows the OS theme while the mode is "system". */
export function initTheme() {
  if (started) return
  started = true
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = media.matches
  media.addEventListener('change', e => {
    systemDark.value = e.matches
    apply()
  })
  apply()
}

export function useTheme() {
  function setMode(next: ThemeMode) {
    mode.value = next
    try { localStorage.setItem(KEY, next) } catch { /* private mode */ }
    apply()
  }

  return { mode, isDark, themeVersion, setMode }
}
