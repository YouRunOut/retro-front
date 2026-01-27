<script setup lang="ts">

  import { computed, onMounted, ref } from 'vue'
  import * as actions from '../core/actions'
  import { useState, currentFont } from '../core/store'
  import * as audio from '../player/audio'
  import formatTime from '../utils/format-time'

  const currentTime = ref(0)
  const duration = ref(0)

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
    <div class="cover-mask">
      <img
        class="cover-image"
        :src="currentTrack?.artworkUrl || '/public/default.png'"
        alt="Cover"
      />
    </div>
    <div class="player-overlay">
      <div class="label">
        <div id="title" class="custom-font" :style="{ '--font-block': currentFont }">
          {{ currentTrack?.name || 'No track' }}
        </div>

        <div id="artist" class="custom-font" :style="{ '--font-block': currentFont }">
          {{ currentTrack?.author || 'No artist' }}
        </div>
      </div>
      <div class="controls">
        <button @click="actions.prev">⏮</button>
        <button @click="actions.togglePlay">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button @click="actions.next">⏭</button>
      </div>

      <div id="progress" class="custom-font" :style="{ '--font-block': currentFont }">
        {{ formatTime(currentTime) }} / {{ formatTime(currentTrack?.duration || 0) }}
      </div>
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
    <!-- <div class="rating">
      <button
        v-for="i in 5"
        :key="i"
        @click="actions.rateCurrentTrack(i)"
        :class="{ active: i <= (currentTrack?.rating ?? 0) }"
      >
        ★
      </button>
    </div> -->

  </div>
</template>
