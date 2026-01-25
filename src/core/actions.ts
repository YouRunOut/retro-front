import { setState, useState } from './store'
import { fetchTracks } from '../api/tracks.api'

import * as audio from '../player/audio'



export async function initApp() {
  // инициализация треков
  const tracks = await fetchTracks()
  setState({ tracks: tracks })
  initAudioEvents()
}



export function togglePlay() {
  const track = useState.tracks[useState.currentIndex]
  if (!track) return

  if (useState.isPlaying) {
    audio.pause()
    setState({ isPlaying: false })
  } else {
    audio.load(track)
    audio.play()
    setState({ isPlaying: true })
  }
}

export function next() {
  const nextIndex = (useState.currentIndex + 1) % useState.tracks.length
  setState({ currentIndex: nextIndex, isPlaying: false })
  togglePlay()
}

export function prev() {
  const prevIndex =
    (useState.currentIndex - 1 + useState.tracks.length) % useState.tracks.length
  setState({ currentIndex: prevIndex, isPlaying: false })
  togglePlay()
}

export function initAudioEvents() {
  audio.onEnded(next)
}
