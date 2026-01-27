import type State from '../types/state'
import type Track from '../types/track'

export const state: State = {
  tracks: [] as Track[],
  currentIndex: 0,
  isPlaying: false,
  volume: 0,
}
