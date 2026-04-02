<script setup lang="ts">

import Player from './components/Player.vue'
import ErrorModal from './components/ErrorModal.vue'
import { useErrorModal } from './composables/useErrorModal'

const errorModal = useErrorModal()

import { onMounted } from 'vue'
import { watch } from 'vue'
import { useState } from './core/store'
import * as actions from './core/actions'



onMounted(async () => {
  // инициализация треков
  await actions.initApp()
})

let currentBg: string | null = null
watch(
  () => [useState.currentIndex, useState.tracks],
  () => {
    const track = useState.tracks[useState.currentIndex]
    if (!track) return

    const newBg = track.artworkUrl || '/public/default.png'

    if (newBg !== currentBg) {
      currentBg = newBg

      document.body.style.setProperty(
        '--bg-image',
        `url(${newBg})`
      )
    }},
  { immediate: true }
)


</script>

<template>

  <ErrorModal
    :visible="errorModal.state.visible"
    :title="errorModal.state.title"
    :message="errorModal.state.message"
    :details="errorModal.state.details"
    @close="errorModal.hideError"
  />

  <Player />
</template>
