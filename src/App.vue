<script setup lang="ts">
import { onMounted } from 'vue'
import Player from './components/Player.vue'
import * as actions from './core/actions'
import { watch } from 'vue'
import { useState } from './core/store'

onMounted(async () => {
  // инициализация треков
  await actions.initApp()
})

watch(
  () => [useState.currentIndex, useState.tracks],
  () => {
    const track = useState.tracks[useState.currentIndex]
    if (track) {
      document.body.style.setProperty(
        '--bg-image',
        `url(${track.artworkUrl || '/tracks/test-cover2.jpg'})`
      )
    }
  },
  { immediate: true }
)


</script>

<template>
  <Player />
</template>
