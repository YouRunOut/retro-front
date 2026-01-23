import { reactive, readonly } from 'vue'
import type State from '../types/state'

// реактивный state
const state = reactive<State>({
  tracks: [],
  currentIndex: 0,
  isPlaying: false
})

// readonly для компонентов, чтобы нельзя было напрямую мутировать
export const useState = readonly(state)

export function setState(patch: Partial<State>) {
  Object.assign(state, patch)
}
