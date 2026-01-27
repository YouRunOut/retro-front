import type Track from '../types/track'

const audio = new Audio()
let currentTrackId: string | null = null

export function load(track: Track) {
  if (currentTrackId !== track.id) {
    audio.src = track.streamUrl
    audio.load()
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

export function getDuration(): number {
  return audio.duration
}

export function onTimeUpdate(callback: (time: number, duration: number) => void) {
  audio.ontimeupdate = () => callback(audio.currentTime, audio.duration)
}