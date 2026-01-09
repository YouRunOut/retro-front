import { state } from './state'
import type State from '../types/state'

type Listener = (state: State) => void

const listeners: Listener[] = []

export function subscribe(fn: Listener) {
  listeners.push(fn)
}

export function setState(patch: Partial<State>) {
  Object.assign(state, patch)
  listeners.forEach(fn => fn(state))
}
