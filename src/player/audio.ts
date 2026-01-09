import type Track from '../types/track'

const audio = new Audio()

export function load(track: Track) {
  audio.src = track.url
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
