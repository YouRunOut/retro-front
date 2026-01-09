import { setState } from './store'
import { state } from './state'
import * as audio from '../player/audio'
import type Track from '../types/track'

const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Retrowave Night',
    url: '/tracks/track1.mp3'
  },
  {
    id: '2',
    title: 'Neon Highway',
    url: '/tracks/track2.mp3'
  }
]

export function initApp() {
  setState({ tracks: mockTracks })
}

export function togglePlay() {
  const track = state.tracks[state.currentIndex]
  if (!track) return

  if (state.isPlaying) {
    audio.pause()
    setState({ isPlaying: false })
  } else {
    audio.load(track)
    audio.play()
    setState({ isPlaying: true })
  }
}

export function next() {
  const nextIndex = (state.currentIndex + 1) % state.tracks.length
  setState({ currentIndex: nextIndex, isPlaying: false })
  togglePlay()
}

export function prev() {
  const prevIndex =
    (state.currentIndex - 1 + state.tracks.length) % state.tracks.length
  setState({ currentIndex: prevIndex, isPlaying: false })
  togglePlay()
}
