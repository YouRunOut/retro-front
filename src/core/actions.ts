import { setState, useState } from './store'
import * as audio from '../player/audio'
import type Track from '../types/track'

const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Retrowave Night',
    url: '/tracks/track1.mp3',
    cover: '../../public/test-cover2.jpg',
    time: 120,
  },
  {
    id: '2',
    title: 'Neon Highway',
    url: '/tracks/track2.mp3',
    cover: '../../public/test-cover.png',
    time: 180,
  }
]

export function initApp() {
  setState({ tracks: mockTracks })
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