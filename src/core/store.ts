import { reactive, readonly } from 'vue'
import type State from '../types/state'

export const currentFont = "Globe Trekker Laser Italic"

// реактивный state
const state = reactive<State>({
  tracks: [],
  currentIndex: 0,
  isPlaying: false,
  volume: 0.8,
})

// readonly для компонентов, чтобы нельзя было напрямую мутировать
export const useState = readonly(state)

export function setState(patch: Partial<State>) {
  Object.assign(state, patch)
}

// const FONT_MAP = {
//   GlobeTrekker: "Globe Trekker Gradient Italic"
// }


