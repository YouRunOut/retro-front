import Hls from 'hls.js'
import { audioEl, setIgnoreError } from './audio'
import { setState } from '../core/store'
import { useErrorModal } from '../composables/useErrorModal'

const HLS_URL = '/api/v1/hls/live.m3u8'

let hls: Hls | null = null
let onMetadataCallback: ((meta: Record<string, any>) => void) | null = null
let isStopped = false
let lastMetaId: number | null = null
let firstBuffer = false
let bufferCheckInterval: ReturnType<typeof setInterval> | null = null
let fragParseRetryCount = 0
let hlsRestartCount = 0
let restartTimer: ReturnType<typeof setTimeout> | null = null

export function onMetadata(cb: (meta: Record<string, any>) => void) {
  onMetadataCallback = cb
}

async function fetchAndParseMetadata() {
  try {
    const res = await fetch(HLS_URL, { cache: 'no-cache' })
    const text = await res.text()
    const all = Array.from(text.matchAll(/#RETRO-META:\s*(\{.+?\})(?:\r?\n|$)/gi))
    if (!all.length) return
    const meta = JSON.parse(all[all.length - 1][1])
    if (meta.id != null && meta.id === lastMetaId) return
    lastMetaId = meta.id
    console.log('[HLS] Track:', meta.name ? `${meta.name} — ${meta.author}` : JSON.stringify(meta))
    onMetadataCallback?.(meta)
    setState({ flowMetadata: meta })

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta.name,
        artist: meta.author,
        album: 'RetroWaveRadio LIVE',
        artwork: meta.artwork
          ? [{ src: meta.artwork, sizes: '512x512', type: 'image/png' }]
          : [],
      })
    }
  } catch {
  }
}

function createHls() {
  if (hls) {
    hls.destroy()
    hls = null
  }

  isStopped = false
  firstBuffer = true
  fragParseRetryCount = 0
  hlsRestartCount = 0

  hls = new Hls({
    enableWorker: false,
    backBufferLength: 30,
    liveSyncDurationCount: 10,
  })

  hls.on(Hls.Events.MEDIA_ATTACHED, () => {
    if (!isStopped) hls!.loadSource(HLS_URL)
  })

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    if (isStopped) return
    fetchAndParseMetadata()
    setState({ isPlaying: true })
  })

  hls.on(Hls.Events.LEVEL_LOADED, () => {
    if (!isStopped) fetchAndParseMetadata()
  })

  hls.on(Hls.Events.FRAG_BUFFERED, (_e, data) => {
    if (isStopped) return
    if (audioEl.buffered.length > 0) {
      fragParseRetryCount = 0
      hlsRestartCount = 0
    }
    console.log('[HLS] FRAG_BUFFERED', data.frag.sn,
      `buffered: ${audioEl.buffered.length ? audioEl.buffered.end(audioEl.buffered.length - 1).toFixed(1) : 0}s`)
    if (firstBuffer) {
      firstBuffer = false
      audioEl.play().catch(() => {})
    }
  })

  hls.on(Hls.Events.ERROR, (_e, data) => {
    if (isStopped) return

    const isStall = data.details === 'bufferStalledError'

    console.log('[HLS] ERROR', {
      type: data.type,
      fatal: data.fatal,
      details: data.details,
      error: data.error?.message,
      response: data.response?.code,
      frag: data.frag?.sn,
      isBufferStall: isStall,
    })

    if (isStall) {
      console.log('[HLS] BUFFER STALLED — буфер пуст, воспроизведение встало')
    }

    if (data.details === 'fragParsingError') {
      fragParseRetryCount++
      if (fragParseRetryCount > 3) {
        hlsRestartCount++
        if (hlsRestartCount > 3) {
          console.log('[HLS] fragParsingError x3 — исчерпаны рестарты')
          const { showError } = useErrorModal()
          showError({
            title: 'Ошибка воспроизведения',
            message: 'Не удалось восстановить воспроизведение после нескольких попыток. Попробуйте обновить страницу.',
          })
          stop()
          return
        }
        console.log(`[HLS] fragParsingError x3 — рестарт #${hlsRestartCount} через 1с`)
        stop()
        restartTimer = setTimeout(() => {
          restartTimer = null
          createHls()
        }, 1000)
        return
      }
      console.log(`[HLS] fragParsingError (${fragParseRetryCount}/3) — перезапуск трансмуксера`)
      hls?.recoverMediaError()
      return
    }

    if (!data.fatal) return

    switch (data.type) {
      case Hls.ErrorTypes.NETWORK_ERROR:
        if (data.details === 'levelParsingError') {
          console.log('[HLS] levelParsingError — полный перезапуск HLS')
          stop()
          createHls()
        } else {
          hls?.startLoad()
        }
        break
      case Hls.ErrorTypes.MEDIA_ERROR:
        hls?.recoverMediaError()
        break
      default:
        stop()
        setState({ isPlaying: false })
    }
  })

  hls.on(Hls.Events.STALL_RESOLVED, () => {
    console.log('[HLS] STALL RESOLVED — буфер восстановлен')
  })

  bufferCheckInterval = setInterval(() => {
    console.log('[HLS] Buffer check:', {
      currentTime: audioEl.currentTime.toFixed(1),
      bufferedEnd: audioEl.buffered.length
        ? audioEl.buffered.end(audioEl.buffered.length - 1).toFixed(1)
        : 0,
      bufferLength: audioEl.buffered.length,
      paused: audioEl.paused,
      readyState: audioEl.readyState,
    })
  }, 3000)

  setIgnoreError(true)
  audioEl.pause()
  audioEl.removeAttribute('src')
  audioEl.load()

  hls.attachMedia(audioEl)
}

export function start() {
  createHls()
}

export function stop() {
  isStopped = true
  lastMetaId = null
  if (restartTimer) {
    clearTimeout(restartTimer)
    restartTimer = null
  }
  if (bufferCheckInterval) {
    clearInterval(bufferCheckInterval)
    bufferCheckInterval = null
  }
  if (hls) {
    hls.destroy()
    hls = null
  }
  setIgnoreError(true)
  audioEl.pause()
  audioEl.removeAttribute('src')
  audioEl.load()
  setState({ isPlaying: false })
}

export function pause() {
  stop()
}

export function resume() {
  createHls()
  setState({ isPlaying: true })
}

export function setVolume(value: number) {
  if (isNaN(value)) return
  audioEl.volume = Math.min(1, Math.max(0, value))
}

export function isPaused(): boolean {
  return audioEl.paused
}
