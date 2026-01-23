<script setup lang="ts">
import Player from './components/Player.vue'
import { watch } from 'vue'
import { useState } from './core/store'

watch(
  () => useState.currentIndex,
  () => {
    const track = useState.tracks[useState.currentIndex]
    document.body.style.setProperty(
      '--bg-image',
      `url(${track?.cover || '/tracks/default.jpg'})`
    )
  },
  { immediate: true }
)

</script>

<template>
  <Player />
</template>
