import { ref, watch, reactive } from 'vue'

export type OverlayFilter = 'none' | 'crt' | 'crt-rgb'

const CONFIG_KEY = 'overlayConfig'

interface CrtParams {
  scanlinesOpacity: number
  noiseBrightness: number
  noiseFlicker: number
  vignetteStrength: number
  glitchIntensity: number
  flickerIntensity: number
  rgbRedIntensity: number
  rgbGreenIntensity: number
  rgbBlueIntensity: number
  rgbMasterOpacity: number
  chromaticTextEnabled: boolean
  glitchEnabled: boolean
  corruptionEnabled: boolean
  corruptionMode: 'loop' | 'event'
}

const DESKTOP_FILTERS: CrtParams = {
  scanlinesOpacity: 0.05,
  noiseBrightness: 0.02,
  noiseFlicker: 0.01,
  vignetteStrength: 0.6,
  glitchIntensity: 1,
  flickerIntensity: 0,
  rgbRedIntensity: 0.15,
  rgbGreenIntensity: 0.08,
  rgbBlueIntensity: 0.15,
  rgbMasterOpacity: 1,
  chromaticTextEnabled: true,
  glitchEnabled: true,
  corruptionEnabled: true,
  corruptionMode: 'event',
}

const MOBILE_FILTERS: CrtParams = {
  scanlinesOpacity: 0.1,
  noiseBrightness: 0,
  noiseFlicker: 0,
  vignetteStrength: 0,
  glitchIntensity: 0.5,
  flickerIntensity: 0,
  rgbRedIntensity: 0,
  rgbGreenIntensity: 0,
  rgbBlueIntensity: 0,
  rgbMasterOpacity: 0,
  chromaticTextEnabled: false,
  glitchEnabled: true,
  corruptionEnabled: false,
  corruptionMode: 'event',
}

function isMobileWidth() {
  return typeof window !== 'undefined' && window.innerWidth < 768
}

function getDefaultParams() {
  return isMobileWidth() ? MOBILE_FILTERS : DESKTOP_FILTERS
}

function loadConfig(): { activeFilter: OverlayFilter; crtParams: CrtParams } {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed.activeFilter === 'string') {
        const filter = parsed.activeFilter as OverlayFilter
        const valid: OverlayFilter[] = ['none', 'crt', 'crt-rgb']
        if (!valid.includes(filter)) parsed.activeFilter = 'crt'
      } else {
        parsed.activeFilter = 'crt'
      }
      if (!parsed.crtParams || typeof parsed.crtParams !== 'object') {
        parsed.crtParams = { ...getDefaultParams() }
      }
      return parsed
    }
  } catch {}
  return { activeFilter: 'crt', crtParams: { ...getDefaultParams() } }
}

function saveConfig() {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({
      activeFilter: activeFilter.value,
      crtParams: { ...crtParams },
    }))
  } catch {}
}

const config = loadConfig()
const activeFilter = ref<OverlayFilter>(config.activeFilter)
const crtParams = reactive<CrtParams>(config.crtParams)

watch(activeFilter, saveConfig)
watch(crtParams, saveConfig, { deep: true })

const corruptionTrigger = ref<(() => void) | null>(null)

export function useOverlayFilter() {
  function setFilter(v: OverlayFilter) {
    activeFilter.value = v
  }

  function resetCrtParams() {
    Object.assign(crtParams, getDefaultParams())
    activeFilter.value = 'crt'
    saveConfig()
  }

  return { activeFilter, setFilter, crtParams, resetCrtParams, corruptionTrigger }
}
