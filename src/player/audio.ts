import type Track from '../types/track'
import { useErrorModal } from '../composables/useErrorModal'
import { useState } from '../core/store'

const audio = new Audio()
export const audioEl = audio
let currentTrackId: string | null = null
let ignoreNextError = false

export function setIgnoreError(ignore: boolean) {
  ignoreNextError = ignore
}

function disableSeeking() {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('seekto', () => {})
    navigator.mediaSession.setActionHandler('seekforward', () => {})
    navigator.mediaSession.setActionHandler('seekbackward', () => {})
  }
}

function hideSeekBar() {
  if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
    navigator.mediaSession.setPositionState({
      duration: Number.MAX_SAFE_INTEGER,
      playbackRate: 1,
      position: 0,
    })
  }
}

export function load(track: Track) {
  if (currentTrackId !== track.id) {
    audio.src = track.streamUrl
    currentTrackId = track.id
  }
  disableSeeking()
  hideSeekBar()
  setMediaSessionMetadata(track)
}

function setMediaSessionMetadata(track: Track) {
  if (!('mediaSession' in navigator)) return

  const artwork: MediaImage[] = track.artworkUrl
    ? [{ src: track.artworkUrl, sizes: '512x512', type: 'image/png' }]
    : []

  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.name,
    artist: track.author,
    album: 'RetroWaveRadio',
    artwork,
  })
}

export function play() {
  disableSeeking()
  hideSeekBar()
  audio.play().catch(() => {})
}

export function pause() {
  audio.pause()
}

export function isPaused() {
  return audio.paused
}

export function onEnded(callback: () => void) {
  audio.onended = callback
}

export function setVolume(value: number) {
  if (isNaN(value)) return
  audio.volume = Math.min(1, Math.max(0, value))
}

export function getCurrentTime(): number {
  return audio.currentTime
}

export function getDurationTime(): number {
  return audio.duration
}

export function getDuration(): number {
  return audio.duration
}

export function onLoadedMetadata(callback: (duration: number) => void) {
  audio.onloadedmetadata = () => {
    hideSeekBar()
    callback(audio.duration)
  }
}

export function onTimeUpdate(callback: (time: number, duration: number) => void) {
  audio.ontimeupdate = () => callback(audio.currentTime, audio.duration)
}

audio.onwaiting = () => {
  console.log('[AUDIO] waiting — браузер ожидает данных')
}

audio.onstalled = () => {
  console.log('[AUDIO] stalled — браузер не получает данные')
}

audio.onemptied = () => {
  console.log('[AUDIO] emptied — медиа-ресурс сброшен')
}

audio.onerror = (e) => {
  if (ignoreNextError) {
    ignoreNextError = false
    return
  }
  console.log('[AUDIO] ERROR', e)
  const { showError } = useErrorModal()
  showError({
    title: 'Track ERROR',
    message: useState.language === 'en'
      ? 'Failed to load track'
      : 'Не удалось загрузить трек',
    details: e.toString(),
  })
}