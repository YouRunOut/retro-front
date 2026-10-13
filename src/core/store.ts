import { reactive, watch } from 'vue'
import type State from '../types/state'
import type { Language, PlayerMode } from '../types/state'

export const fontOptions = [
  { value: 'Globe Trekker Super Italic', label: 'Super Italic' },
  { value: 'Globe Trekker Laser Italic', label: 'Laser Italic' },
  { value: 'Globe Trekker Gradient Italic', label: 'Gradient Italic' },
]

const savedVolume = localStorage.getItem('volume')
const initialVolume = savedVolume !== null ? Number(savedVolume) : 0.8

const savedLanguage = localStorage.getItem('language') as Language | null

function detectBrowserLanguage(): Language {
  const lang = navigator.language?.slice(0, 2)
  if (lang === 'ru') return 'ru'
  return 'en'
}

const initialLanguage: Language = savedLanguage ?? detectBrowserLanguage()

const savedFont = localStorage.getItem('font')
const savedPlayerMode = localStorage.getItem('playerMode') as PlayerMode | null

const state = reactive<State>({
  tracks: [],
  currentIndex: 0,
  isPlaying: false,
  volume: initialVolume,
  page: 0,
  language: initialLanguage,
  sessionId: '',
  isTagFiltered: false,
  tagNames: [],
  loading: false,
  playerMode: savedPlayerMode ?? 'flow',
  currentFont: savedFont ?? 'Globe Trekker Laser Italic',
  flowMetadata: null,
})

watch(
  () => state.volume,
  (val) => {
    localStorage.setItem('volume', val.toString())
  }
)

watch(
  () => state.playerMode,
  (val) => {
    localStorage.setItem('playerMode', val)
  }
)

// readonly для компонентов, чтобы нельзя было напрямую мутировать
export const useState = state //readonly(state)

export function setState(patch: Partial<State>) {
  Object.assign(state, patch)
}

