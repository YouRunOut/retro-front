<script setup lang="ts">

  import { computed, onMounted, onBeforeUnmount, ref, nextTick, watch } from 'vue'
  import { useHead } from '@unhead/vue'
import { useLocale } from '../composables/useLocale'
import * as actions from '../core/actions'
import { useState } from '../core/store'
import * as audio from '../player/audio'
import * as hls from '../player/hls'
import formatTime from '../utils/format-time'
import { useTilt } from '../composables/useTilt'
import { useOverlayFilter } from '../composables/useOverlayFilter'

  const { t } = useLocale()

  const cover = ref<HTMLElement | null>(null)

  useTilt(() => cover.value)

  const currentTime = ref(0)
  const duration = ref(0)
  const MIN_R = 40
  const MAX_R = 70

  const radii = computed(() => {
    if (useState.playerMode === 'flow') {
      return { left: MAX_R, right: MAX_R }
    }

    const p = duration.value > 0 
      ? Math.min(1, Math.max(0, currentTime.value / duration.value)) 
      : 0
      
    return {
      left:  MIN_R + (MAX_R - MIN_R) * p,
      right: MAX_R - (MAX_R - MIN_R) * p
    }
  })


  onMounted(() => {
    audio.onTimeUpdate((time, dur) => {
      currentTime.value = time
      duration.value = dur
    })
    hls.onMetadata((meta) => {
      if (meta.name && meta.author) {
        nextTick(checkOverflow)
      }
    })
    document.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    resizeObserver?.disconnect()
  })

  function onKeydown(e: KeyboardEvent) {
    if (e.target instanceof HTMLElement && e.target.closest('.menu-panel')) return

    switch (e.key) {
      case ' ':
        e.preventDefault()
        actions.togglePlay()
        break
      case 'ArrowUp':
        e.preventDefault()
        actions.setVolume(Math.min(1, useState.volume + 0.05))
        break
      case 'ArrowDown':
        e.preventDefault()
        actions.setVolume(Math.max(0, useState.volume - 0.05))
        break
      case 'ArrowLeft':
        if (useState.playerMode !== 'classic') return
        e.preventDefault()
        actions.prev()
        break
      case 'ArrowRight':
        if (useState.playerMode !== 'classic') return
        e.preventDefault()
        actions.next()
        break
      case 'm':
        e.preventDefault()
        toggleMute()
        break
    }
  }

  const volume = computed(() => useState.volume)
  
  const volumeStyle = computed(() => {
    const percent = volume.value * 100
    return {
      background: `linear-gradient(
        to right,
        #CA2AD6 ${percent}%,
        #2c2c2c ${percent}%
      )`
    }
  })
  const isMuted = computed(() => volume.value === 0)

  const preMuteVolume = ref(0.8)

  function toggleMute() {
    if (useState.volume > 0) {
      preMuteVolume.value = useState.volume
      actions.setVolume(0)
    } else {
      actions.setVolume(preMuteVolume.value)
    }
  }

  const volumeIcon = computed(() => {
    if (volume.value === 0) return '/volume-off.svg'
    if (volume.value < 0.5) return '/volume-min.svg'
    return '/volume-max.svg'
  })

  const isPlaying = computed(() => useState.isPlaying)

  const trackInfoRef = ref<HTMLElement | null>(null)
  const titleRef = ref<HTMLElement | null>(null)
  const artistRef = ref<HTMLElement | null>(null)
  const titleMeasurer = ref<HTMLElement | null>(null)
  const artistMeasurer = ref<HTMLElement | null>(null)
  const titleOverflows = ref(false)
  const artistOverflows = ref(false)

  let resizeObserver: ResizeObserver | null = null
  let rafId: number | null = null

  function checkOverflow() {
    if (rafId !== null) return
    rafId = requestAnimationFrame(() => {
      rafId = null
      if (titleMeasurer.value && titleRef.value) {
        titleOverflows.value = titleMeasurer.value.scrollWidth > titleRef.value.clientWidth
      }
      if (artistMeasurer.value && artistRef.value) {
        artistOverflows.value = artistMeasurer.value.scrollWidth > artistRef.value.clientWidth
      }
    })
  }

  function initResizeObserver() {
    nextTick(() => {
      checkOverflow()
      resizeObserver = new ResizeObserver(checkOverflow)
      if (trackInfoRef.value) resizeObserver.observe(trackInfoRef.value)
    })
  }

  onMounted(initResizeObserver)

  const currentTrack = computed(() => {
    if (useState.playerMode === 'flow' && useState.flowMetadata) {
      return {
        name: useState.flowMetadata.name,
        author: useState.flowMetadata.author,
        artworkUrl: useState.flowMetadata.artwork || '/cassette-cover.png',
      }
    }

    const tracks = useState.tracks
    if (!Array.isArray(tracks) || tracks.length === 0) return null

    return useState.tracks[useState.currentIndex] ?? null
  })

  const glitching = ref(false)
  let glitchTimer: ReturnType<typeof setTimeout> | null = null
  let swapTimer: ReturnType<typeof setTimeout> | null = null
  const displayedTrack = ref(currentTrack.value)

  const { corruptionTrigger } = useOverlayFilter()

  watch(currentTrack, async (newTrack) => {
    nextTick(checkOverflow)
    if (glitchTimer !== null) {
      clearTimeout(glitchTimer)
      glitchTimer = null
    }
    if (swapTimer !== null) {
      clearTimeout(swapTimer)
      swapTimer = null
    }
    corruptionTrigger.value?.()
    currentTime.value = 0
    const apiDuration = useState.playerMode === 'flow'
      ? useState.flowMetadata?.duration
      : useState.tracks[useState.currentIndex]?.duration
    if (apiDuration) duration.value = apiDuration / 1000
    glitching.value = false
    await nextTick()
    if (trackInfoRef.value) {
      void trackInfoRef.value.offsetHeight
    }
    glitching.value = true
    swapTimer = setTimeout(() => {
      displayedTrack.value = newTrack
      nextTick(checkOverflow)
    }, 150)
    glitchTimer = setTimeout(() => {
      glitching.value = false
      glitchTimer = null
    }, 550)
  })

  const tagTitle = computed(() => {
    if (!useState.isTagFiltered) return null
    const names = useState.tagNames
    if (!names.length) return null
    return names.length === 1 ? names[0] : names[Math.floor(Math.random() * names.length)]
  })

  const pageTitle = computed(() => {
    if (tagTitle.value) return `${tagTitle.value} — RetroWaveRadio`
    if (useState.playerMode === 'flow') {
      if (currentTrack.value) return `${currentTrack.value.name} - ${currentTrack.value.author} | LIVE | RetroWaveRadio`
      return 'LIVE | RetroWaveRadio'
    }
    if (currentTrack.value) return `${currentTrack.value.name} — ${currentTrack.value.author} | RetroWaveRadio`
    return 'RetroWaveRadio'
  })

  const pageOgTitle = computed(() => {
    if (tagTitle.value) return `${tagTitle.value} — RetroWaveRadio`
    if (useState.playerMode === 'flow') {
      if (currentTrack.value) return `${currentTrack.value.name} - ${currentTrack.value.author} | LIVE`
      return 'LIVE'
    }
    if (currentTrack.value) return `${currentTrack.value.name} — ${currentTrack.value.author}`
    return 'RetroWaveRadio'
  })

  useHead({
    title: () => pageTitle.value,
    meta: () => [
      { property: 'og:title', content: pageOgTitle.value },
      { property: 'og:description', content: t('about.description') },
      { property: 'og:image', content: currentTrack.value?.artworkUrl || '/default.jpg' },
      { property: 'og:url', content: 'https://retrowave-radio.ru' },
      { property: 'og:type', content: 'music.radio_station' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageOgTitle.value },
      { name: 'twitter:image', content: currentTrack.value?.artworkUrl || '/default.jpg' },
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'MusicRadioStation',
          name: 'RetroWaveRadio',
          description: 'Online radio player streaming retro, synthwave, and electronic music.',
          url: 'https://retrowave-radio.ru',
          logo: 'https://retrowave-radio.ru/logo.png',
        }),
      },
    ],
  })

</script>

<template>
    <img
      class="logo unselectable"
      src="/logo.png"
      :alt="t('common.logo')"
    >


  <div id="player">
    <!-- кассета -->
    <div class="cover-scene">
      <div class="cover-wrapper unselectable" ref="cover">
        <img
          class="cover-image layer-between"
          :src="currentTrack?.artworkUrl || '/cassette-cover.png'"
          :alt="t('common.cover')"
        />
        <img
          class="tape t-left layer-between2"
          :style="{ '--r': `${radii.left}%` }"
          :src="!isPlaying ? '/tape2.png' : '/tape-anim.gif'"
          :alt="t('common.cover')"
        />
        <img
          class="tape t-right layer-between2"
          :style="{ '--r': `${radii.right}%` }"
          :src="!isPlaying ? '/tape0.png' : '/tape-anim.gif'"
          :alt="t('common.cover')"
        />
        <div class="layer-сassette layer-1"></div>
        <div class="layer-сassette layer-2"></div>
        <div class="layer-сassette layer-3"></div>
        <div class="layer-сassette layer-4"></div>
        <div class="layer-сassette layer-5"></div>
        <div class="layer-glass layer-6"></div>
        <div class="layer-bolts layer-7"></div>
        
        
        
        <img
          class="cover-frame"
          src="/cassette.png"
          alt=""
        />
        <!-- "тень" кнопок -->
        <!-- <div class="controls layer-buttons layer-6 unselectable">
          <button @click="actions.prev">
            <img src="/rewind-back.svg" alt="⏭" />
          </button>
          <button>
            <img :src="isPlaying ? '/pause.svg' : '/play.svg'" alt="⏹" />
          </button>
          <button @click="actions.next">
            <img src="/rewind-forward.svg" alt="⏭" />
          </button>
        </div> -->
        

      </div>

    </div>
    <!-- track-info -->
    <div ref="trackInfoRef" class="track-info" :class="{ 'glitch-active': glitching }">

      <div
        ref="titleRef"
        id="title"
        class="custom-font"
        :class="{ 'track-overflow': titleOverflows }"
        :style="{ '--font-block': useState.currentFont }"
      >
        <span class="track-text">{{ displayedTrack?.name || '' }}</span>
        <div v-show="titleOverflows" class="track-marquee-inner">
          <div class="track-marquee-runner">
            <span>{{ displayedTrack?.name || '' }}</span>
            <span>{{ displayedTrack?.name || '' }}</span>
          </div>
        </div>
        <span ref="titleMeasurer" class="track-measurer" aria-hidden="true">{{ displayedTrack?.name || '' }}</span>
      </div>

      <div
        ref="artistRef"
        id="artist"
        class="custom-font"
        :class="{ 'track-overflow': artistOverflows }"
        :style="{ '--font-block': useState.currentFont }"
      >
        <span class="track-text">{{ displayedTrack?.author || '' }}</span>
        <div v-show="artistOverflows" class="track-marquee-inner">
          <div class="track-marquee-runner">
            <span>{{ displayedTrack?.author || '' }}</span>
            <span>{{ displayedTrack?.author || '' }}</span>
          </div>
        </div>
        <span ref="artistMeasurer" class="track-measurer" aria-hidden="true">{{ displayedTrack?.author || '' }}</span>
      </div>

      <div
        id="progress"
        class="custom-font"
        :style="{ '--font-block': useState.currentFont }"
      >
        <template v-if="useState.playerMode === 'flow'">
          <span class="live-dot">•</span>
          <span class="live-indicator">LIVE</span>
          <span v-if="useState.flowMetadata?.listeners != null" class="listener-block">
            <span class="listener-label"> listeners </span>
            <span class="listener-count">{{ useState.flowMetadata.listeners }}</span>
          </span>
        </template>
        <template v-else>{{ formatTime(currentTime) }} / {{ formatTime(duration || 0) }}</template>
      </div>

      <!-- кнопки -->
      <div class="controls unselectable">
        <button v-if="useState.playerMode === 'classic'" class="unselectable" @click="actions.prev">
          <img src="/rewind-back.svg" alt="⏭" />
        </button>
        <button class="unselectable" @click="actions.togglePlay">
          <img :src="isPlaying ? '/pause.svg' : '/play.svg'" alt="⏹" />
        </button>
        <button v-if="useState.playerMode === 'classic'" class="unselectable" @click="actions.next">
          <img src="/rewind-forward.svg" alt="⏭" />
        </button>
      </div>

      <div class="volume unselectable">
        <img :src="volumeIcon" class="volume-icon" @click="toggleMute" />
        <input
          class="volume-slider"
          :class="{ muted: isMuted }"
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="volume"
          :style="volumeStyle"
          @input="(e) => actions.setVolume(Number((e.target as HTMLInputElement).value))"
        />
      </div>

    </div>

  </div>
</template>
