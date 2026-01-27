import type Track from './track'

export default interface State {
  tracks: Track[]
  currentIndex: number
  isPlaying: boolean
  volume: number
}
