import type Track from './track'

export type Language = 'ru' | 'en'
export type PlayerMode = 'classic' | 'flow'

export interface FlowMetadata {
  id: number
  name: string
  author: string
  artwork?: string
  duration?: number
  listeners?: number
}

export default interface State {
  tracks: Track[]
  currentIndex: number
  isPlaying: boolean
  volume: number
  page: number
  language: Language
  sessionId: string
  isTagFiltered: boolean
  tagNames: string[]
  loading: boolean
  playerMode: PlayerMode
  currentFont: string
  flowMetadata: FlowMetadata | null
}
