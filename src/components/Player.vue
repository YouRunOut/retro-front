<script setup lang="ts">

import { computed, onMounted, ref } from 'vue'
import * as actions from '../core/actions'
import { useState } from '../core/store'
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

const currentTrack = computed(() => {
  const tracks = useState.tracks

  if (!Array.isArray(tracks) || tracks.length === 0) return null

  return useState.tracks[useState.currentIndex] ?? null
})

const isPlaying = computed(() => useState.isPlaying)

</script>

<template>
  <div id="player">
    <img
      id="cover"
      :src="currentTrack?.artworkUrl || '.../public/tracks/text-cover2.jpg'"
      alt="Cover"
    />
    <div id="title">{{ currentTrack?.name || 'No track' }}</div>
    <div id="artist">{{ currentTrack?.author || 'No artist' }}</div>
    <div id="progress">
      {{ formatTime(currentTime) }} / {{ formatTime(currentTrack?.duration || 0) }}
    </div>

    <div class="controls">
      <button @click="actions.prev">⏮</button>
      <button @click="actions.togglePlay">
        {{ isPlaying ? '⏸' : '▶' }}
      </button>
      <button @click="actions.next">⏭</button>
    </div>
  </div>
</template>
