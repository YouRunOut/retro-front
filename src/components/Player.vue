<script setup lang="ts">

  import { computed, onMounted, ref } from 'vue'
  import * as actions from '../core/actions'
  import { useState, currentFont } from '../core/store'
  import * as audio from '../player/audio'
  import formatTime from '../utils/format-time'
  import { useTilt } from '../composables/useTilt'
  import { useIdleTilt } from '../composables/useIdleTilt'

  const cover = ref<HTMLElement | null>(null)

  // mouse tilt
  useTilt(() => cover.value)

  // idle tilt
  useIdleTilt(() => cover.value, {
    idleDelay: 2000,
    intensity: 5,
    speed: 0.02,
  })

  const currentTime = ref(0)
  const duration = ref(0)
  const hoverRating = ref(0)

  onMounted(() => {
    audio.onTimeUpdate((time, dur) => {
      currentTime.value = time
      duration.value = dur
    })
  })

  const volume = computed(() => useState.volume)
  const volumeStyle = computed(() => {
    const percent = volume.value * 100
    return {
      background: `linear-gradient(
        to right,
        #ff285e ${percent}%,
        #2c2c2c ${percent}%
      )`
    }
  })
  const isMuted = computed(() => volume.value === 0)
  const isPlaying = computed(() => useState.isPlaying)
  const currentTrack = computed(() => {
    const tracks = useState.tracks

    if (!Array.isArray(tracks) || tracks.length === 0) return null

    return useState.tracks[useState.currentIndex] ?? null
  })

</script>

<template>
  <div id="player">
    <img
      class="logo"
      src="/public/logo_pulse.png"
      alt="Logo"
    >
    <div class="cover-scene">

      <div class="cover-wrapper unselectable" ref="cover">
        <img
          class="cover-image layer-between"
          :src="currentTrack?.artworkUrl || '/public/cassette-glass.png'"
          alt="Cover"
        />
        <div class="layer-сassette layer-1"></div>
        <div class="layer-сassette layer-2"></div>
        <div class="layer-сassette layer-3"></div>
        <div class="layer-сassette layer-4"></div>
        <div class="layer-сassette layer-5"></div>

        <!-- <div class="layer-buttons layer-6"></div>
        <div class="layer-buttons layer-7"></div>
        <div class="layer-buttons layer-8"></div>
        <div class="layer-buttons layer-9"></div>
        <div class="layer-buttons layer-10"></div> -->
        
        <img
          class="cover-frame"
          src="/public/cassette.png"
          alt=""
        />

        <div class="controls layer-6 unselectable">
          <button @click="actions.prev">⏮</button>
          <button :class="{ buttonplay: !isPlaying }" @click="actions.togglePlay">
            {{ isPlaying ? '⏹' : '▶' }}
          </button>
          <button @click="actions.next">⏭</button>
        </div>

      </div>

    </div>

      <!-- <div class="controls layer-6 unselectable">
        <button @click="actions.prev">⏮</button>
        <button :class="{ buttonplay: !isPlaying }" @click="actions.togglePlay">
          {{ isPlaying ? '⏹' : '▶' }}
        </button>
        <button @click="actions.next">⏭</button>
      </div> -->

    <div
      id="title"
      class="custom-font"
      :style="{ '--font-block': currentFont }"
    >
      {{ currentTrack?.name || 'No track' }}
    </div>

    <div
      id="artist"
      class="custom-font"
      :style="{ '--font-block': currentFont }"
    >
      {{ currentTrack?.author || 'No artist' }}
    </div>

    <div
      id="progress"
      class="custom-font"
      :style="{ '--font-block': currentFont }"
    >
      {{ formatTime(currentTime) }} / {{ formatTime(duration || 0) }}
    </div>


    <!-- громкость -->
    <input
      class="volume-slider"
      :class="{ muted: isMuted }"
      type="range"
      min="0"
      max="1"
      step="0.01"
      :value="volume"
      :style="volumeStyle"
      @input="actions.setVolume(Number(($event.target as HTMLInputElement).value))"
    />


    <!-- рейтинг -->
    <!-- <div v-if="currentTrack" class="rating"> -->
      <!-- <label v-for="i in 5" :key="i"> -->
        <!-- @change="actions.rateCurrentTrack(i, currentTrack.id)" -->
        <!-- <input
          type="radio"
          class="button"
          name="rating"
          :value="i"
          v-model="currentTrack.rating"
          
          hidden
        /> -->
        <!-- <span>
          {{ i <= (hoverRating > 0 ? hoverRating : (currentTrack?.rating ?? 0)) ? '☆' : '★' }}
        </span> -->
      <!-- </label> -->
      <!-- @click="actions.rateCurrentTrack(i, currentTrack?.id)" -->
      <!-- :class="{ active: i <= (currentTrack?.rating ?? 0) }" -->
      <!-- <button
        v-for="i in 5"
        :key="i"
        @mouseenter="hoverRating = i"
        @mouseleave="hoverRating = 0"
        
      >
        {{ i <= (hoverRating || (currentTrack?.rating ?? 0)) ? '★' : '☆' }}
      </button> -->
    <!-- </div> -->

  </div>
</template>
