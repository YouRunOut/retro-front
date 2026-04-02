import type Track from '../types/track'

import { useErrorModal } from '../composables/useErrorModal'
import { useState } from '../core/store'

const audio = new Audio()
let currentTrackId: string | null = null

export function load(track: Track) {
  if (currentTrackId !== track.id) {
    audio.src = track.streamUrl
    currentTrackId = track.id
  }
}

export function play() {
  audio.play()
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
    callback(audio.duration)
  }
}

export function onTimeUpdate(callback: (time: number, duration: number) => void) {
  audio.ontimeupdate = () => callback(audio.currentTime, audio.duration)
}



// audio.onended = () => {
//   const { showError } = useErrorModal()
//   showError({
//     title: `Track ENDED`,
//     message: `Трек ${useState.tracks[useState.currentIndex]?.name} закончился на ${audio.currentTime} из ${audio.duration}`,
//     details: "",
//   })
// }

// audio.onpause = () => {
//   console.log('PAUSE', audio.currentTime)
//   const { showError } = useErrorModal()
//   showError({
//     title: `Track PAUSE`,
//     message: `Трек ${useState.tracks[useState.currentIndex]?.name} был приостановлен на ${audio.currentTime} из ${audio.duration}`,
//     details: "",
//   })
// }

audio.onerror = (e) => {
  console.log('ERROR', e)
  const { showError } = useErrorModal()
  showError({
    title: `Track ERROR`,
    message: `Ошибка трека`,
    details: e.toString(),
  })
}