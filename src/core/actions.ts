import { setState, useState } from './store'
import { fetchTracks } from '../api/http'

import * as audio from '../player/audio'



export async function initApp() {
  const tracks = await fetchTracks()
  setState({ tracks })
}

export function togglePlay() {
  const track = useState.tracks[useState.currentIndex]
  if (!track) return

  if (useState.isPlaying) {
    audio.pause()
    setState({ isPlaying: false })
    console.log('Paused')
  } else {
    audio.load(track)
    audio.play()
    setState({ isPlaying: true })
    console.log('Playing:', track.title)
  }
}

export function next() {
  const nextIndex = (useState.currentIndex + 1) % useState.tracks.length
  console.log('Next index:', nextIndex)
  setState({ currentIndex: nextIndex, isPlaying: false })
  togglePlay()
}

export function prev() {
  const prevIndex =
    (useState.currentIndex - 1 + useState.tracks.length) % useState.tracks.length
  console.log('Prev index:', prevIndex)
  setState({ currentIndex: prevIndex, isPlaying: false })
  togglePlay()
}