<script setup lang="ts">
import { computed } from 'vue'
import * as actions from '../core/actions'
import { useState } from '../core/store'

const title = computed(() => {
  const track = useState.tracks[useState.currentIndex]
  return track?.title || 'No track'
})

const cover = computed(() => {
  const track = useState.tracks[useState.currentIndex]
  return track?.cover || '/tracks/default.jpg'
})

const isPlaying = computed(() => useState.isPlaying)

// инициализация треков
actions.initApp()
</script>

<template>
  <div id="player">
    <img id="cover" :src="cover" alt="Cover" />
    <div id="title">{{ title }}</div>

    <div class="controls">
      <button @click="actions.prev">⏮</button>
      <button @click="actions.togglePlay">
        {{ isPlaying ? '⏸' : '▶' }}
      </button>
      <button @click="() => { console.log('Next button clicked'); actions.next() }">⏭</button>

    </div>
  </div>
</template>
