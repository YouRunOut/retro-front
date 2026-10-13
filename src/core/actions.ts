import type Track from '../types/track'
import type { PlayerMode } from '../types/state'
import { setState, useState } from './store'
import { fetchTracks } from '../api/tracks.api'
import { fetchTracksByTag } from '../api/tags.api'
import { rateTrack } from '../api/rating'

import * as audio from '../player/audio'
import * as hls from '../player/hls'


async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 2000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i === retries - 1) throw e
      await new Promise(r => setTimeout(r, delayMs))
    }
  }
  throw new Error('unreachable')
}

export async function initApp() {
  if (useState.playerMode === 'flow') {
    setState({ loading: false })
    initAudioEvents()
    setVolume(useState.volume)
    return
  }

  const sessionId = crypto.randomUUID()
  setState({ sessionId })

  setState({ loading: true })

  let tagNames: string[] = []
  try {
    const savedTagNames = localStorage.getItem('selectedTagNames')
    if (savedTagNames) {
      tagNames = JSON.parse(savedTagNames)
    }
  } catch {
    tagNames = []
  }
  const isTagFiltered = tagNames.length > 0

  if (isTagFiltered) {
    setState({ isTagFiltered: true, tagNames })
  }

  let tracks: Track[]
  try {
    tracks = await withRetry(() =>
      isTagFiltered
        ? fetchTracksByTag(tagNames)
        : fetchTracks(sessionId)
    )
  } catch (e) {
    const { useErrorModal } = await import('../composables/useErrorModal')
    useErrorModal().showError({
      title: useState.language === 'en' ? 'Init Error' : 'Ошибка инициализации',
      message: useState.language === 'en'
        ? 'Failed to load tracks. Please reload the page.'
        : 'Не удалось загрузить треки. Перезагрузите страницу.',
      details: e instanceof Error ? e.message : String(e),
    })
    tracks = []
  }

  setState({ loading: false, tracks })
  initAudioEvents()
  setVolume(useState.volume)
}

/* ===================== rating ===================== */

export async function rateCurrentTrack(rating: number, trackId?: string) {
  const track = useState.tracks[trackId ? useState.tracks.findIndex(t => t.id === trackId) : useState.currentIndex]
  if (!track) return

  try {
    await rateTrack(track.id, rating)
  } catch {
  }
}

/* ===================== volume ===================== */

export function setVolume(value: number) {
  audio.setVolume(value)
  setState({ volume: value })
}

/* ===================== player mode ===================== */

export async function setPlayerMode(mode: PlayerMode) {
  if (useState.playerMode === 'flow') {
    hls.stop()
  } else {
    audio.pause()
  }
  setState({ isPlaying: false })

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('previoustrack', mode === 'flow' ? null : prev)
    navigator.mediaSession.setActionHandler('nexttrack', mode === 'flow' ? null : next)
  }

  if (mode === 'flow') {
    setState({ isTagFiltered: false, tagNames: [] })
    localStorage.removeItem('selectedTagIds')
    localStorage.removeItem('selectedTagNames')
  }

  setState({ playerMode: mode })

  if (mode === 'classic' && !useState.tracks.length) {
    if (!useState.sessionId) {
      setState({ sessionId: crypto.randomUUID() })
    }
    setState({ loading: true })
    try {
      const tracks = await fetchTracks(useState.sessionId)
      if (tracks.length) {
        setState({ tracks, currentIndex: 0, isTagFiltered: false })
      }
    } catch { /* handled in fetchTracks/http */ }
    setState({ loading: false })
  }
}

/* ===================== playback ===================== */

export function togglePlay() {
  if (useState.playerMode === 'flow') {
    if (useState.isPlaying) {
      hls.pause()
    } else {
      hls.resume()
    }
    return
  }

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

export async function next() {
  if (useState.playerMode === 'flow') return
  if (!useState.tracks.length) return

  const isLast =
    useState.currentIndex === useState.tracks.length - 1

  // если последний трек → пробуем догрузить
  if (isLast) {
    await loadNextPage()
  }

  const nextIndex = useState.currentIndex + 1

  // если даже после догрузки дальше идти некуда → цикл
  const finalIndex =
    nextIndex < useState.tracks.length ? nextIndex : 0

  setState({
    currentIndex: finalIndex,
    isPlaying: false
  })

  togglePlay()
}

export function prev() {
  if (useState.playerMode === 'flow') return
  const prevIndex =
    (useState.currentIndex - 1 + useState.tracks.length) % useState.tracks.length
  setState({ currentIndex: prevIndex, isPlaying: false })
  togglePlay()
}

export function initAudioEvents() {
  audio.onEnded(next)

  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => { togglePlay() })
    navigator.mediaSession.setActionHandler('pause', () => { togglePlay() })
    navigator.mediaSession.setActionHandler('previoustrack', prev)
    navigator.mediaSession.setActionHandler('nexttrack', next)
  }
}

export async function resetToShuffled() {
  if (useState.playerMode === 'flow') return
  setState({ loading: true })
  const tracks = await fetchTracks(useState.sessionId)
  setState({ loading: false })
  if (!tracks.length) return
  setState({ tracks, currentIndex: 0, isTagFiltered: false, isPlaying: false })
  togglePlay()
}

export function pausePlayback() {
  if (!useState.isPlaying) return
  if (useState.playerMode === 'flow') {
    hls.pause()
  } else {
    audio.pause()
  }
  setState({ isPlaying: false })
}

export async function loadNextPage() {
  setState({ loading: true })

  let newTracks: Track[] = []

  try {
    if (useState.isTagFiltered) {
      newTracks = await fetchTracksByTag(useState.tagNames)
    } else {
      newTracks = await fetchTracks(useState.sessionId)
    }
  } catch {
    // ошибка уже показана в http.ts
  }

  setState({ loading: false })

  if (!newTracks.length) return

  setState({
    tracks: [...useState.tracks, ...newTracks],
  })
}

