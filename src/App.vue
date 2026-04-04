<script setup lang="ts">

import Player from './components/Player.vue'
import ErrorModal from './components/ErrorModal.vue'
import { useErrorModal } from './composables/useErrorModal'

const errorModal = useErrorModal()

import { ref, watch, onMounted } from 'vue'
import { useState } from './core/store'
import * as actions from './core/actions'


onMounted(async () => {
  // инициализация треков
  await actions.initApp()
})

let fadeTimeout: ReturnType<typeof setTimeout> | null = null
let animationFrameId: number | null = null
const bg = ref('')
const bgEl = ref<HTMLElement | null>(null)
let currentBg: string | null = null

watch(
  () => [useState.currentIndex, useState.tracks],
  () => {
    const track = useState.tracks[useState.currentIndex]
    if (!track || !bgEl.value) return

    const newBg = track.artworkUrl || '/public/default.png'
    if (newBg === currentBg) return

    currentBg = newBg

    // отменяем предыдущие таймауты/фреймы
    if (fadeTimeout) clearTimeout(fadeTimeout)
    if (animationFrameId) cancelAnimationFrame(animationFrameId)

    // сразу начинаем fade-out
    bgEl.value.classList.add('fade-out')

    fadeTimeout = setTimeout(() => {
      // смена картинки
      bg.value = newBg

      // нужно чтобы браузер применил стиль
      animationFrameId = requestAnimationFrame(() => {
        bgEl.value?.classList.remove('fade-out')
      })
    }, 400)
  },
  { immediate: true }
)

</script>

<template>

  <div
    ref="bgEl"
    class="bg"
    :style="{ backgroundImage: `url(${bg})` }"
  />

  <ErrorModal
    :visible="errorModal.state.visible"
    :title="errorModal.state.title"
    :message="errorModal.state.message"
    :details="errorModal.state.details"
    @close="errorModal.hideError"
  />

  

  <Player />
</template>
