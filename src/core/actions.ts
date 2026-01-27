import { setState, useState } from './store'
import { fetchTracks } from '../api/tracks.api'
import { rateTrack } from '../api/rating'

import * as audio from '../player/audio'
// import { useErrorModal } from '../composables/useErrorModal'
// import formatTime from '../utils/format-time'


export async function initApp() {
  // инициализация треков
  const tracks = await fetchTracks()
  setState({ tracks: tracks })
  initAudioEvents()
}

/* ===================== rating ===================== */

export async function rateCurrentTrack(value: number) {
  const track = useState.tracks[useState.currentIndex]
  if (!track) return

  // optimistic update
  // track.rating = value
  // setState({ tracks: [...useState.tracks] })

  try {
    await rateTrack(track.id, value)
  } catch {
    // при желании можно откатить
  }
}

/* ===================== volume ===================== */

export function setVolume(value: number) {
  audio.setVolume(value)
  setState({ volume: value })
}

/* ===================== playback ===================== */

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
  // const { showError } = useErrorModal()
  // showError({
  //   title: `Track ended`,
  //   message: `Трек ${useState.tracks[useState.currentIndex]?.name} закончился на ${formatTime(audio.getCurrentTime())} из ${formatTime(audio.getDuration())}`,
  //   details: audio.getCurrentTime().toString(),
  // })
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
