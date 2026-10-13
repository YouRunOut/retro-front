<script setup lang="ts">

import Player from './components/Player.vue'
import ErrorModal from './components/ErrorModal.vue'
import BurgerMenu from './components/BurgerMenu.vue'
import OverlayFilters from './components/OverlayFilters.vue'
import { useErrorModal } from './composables/useErrorModal'
import { useSafeBottom } from './composables/useSafeBottom'
import { useStableHeight } from './composables/useStableHeight'

const errorModal = useErrorModal()
useSafeBottom()
useStableHeight()

import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useState, setState } from './core/store'
import * as actions from './core/actions'

let driftTimer: number | null = null

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function setBgDrift() {
  const el = document.querySelector<HTMLElement>('.bg')
  if (!el) return
  const x = randomRange(-20, 20)
  const y = randomRange(-20, 20)
  el.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`
  document.documentElement.style.setProperty('--bg-body-x', `${-x}deg`)
  document.documentElement.style.setProperty('--bg-body-y', `${-y}deg`)
  document.documentElement.style.setProperty('--bg-body-scale', String(randomRange(1.1, 1.2)))
}

const COVER_SCALE_KEY = 'coverScale'

function isMobileViewport() {
  return window.matchMedia('(orientation: portrait) and (max-width: 480px)').matches
      || window.matchMedia('(orientation: landscape) and (max-height: 600px)').matches
}

onMounted(async () => {
  const saved = localStorage.getItem(COVER_SCALE_KEY)
  if (saved !== null && !isMobileViewport()) {
    const el = document.querySelector<HTMLElement>('.cover-wrapper')
    if (el) el.style.scale = String(Number(saved))
  }
  try {
    await actions.initApp()
  } catch {
    setState({ loading: false })
  }
  setBgDrift()
  driftTimer = window.setInterval(setBgDrift, 8000)
})

onBeforeUnmount(() => {
  if (driftTimer) clearInterval(driftTimer)
  document.documentElement.style.removeProperty('--bg-body-y')
  document.documentElement.style.removeProperty('--bg-body-scale')
})

const layer0 = ref('/default.jpg')
const layer1 = ref('')
const activeLayer = ref(0)
const bgEl0 = ref<HTMLElement | null>(null)
const bgEl1 = ref<HTMLElement | null>(null)
let currentBg: string | null = null

watch(
  () => [
    useState.currentIndex,
    useState.tracks,
    useState.flowMetadata,
    useState.playerMode,
  ],
  () => {
    if (!bgEl0.value || !bgEl1.value) return

    let artworkUrl: string | null = null

    if (useState.playerMode === 'flow') {
      artworkUrl = useState.flowMetadata?.artwork || null
    } else {
      const track = useState.tracks[useState.currentIndex]
      if (track) artworkUrl = track.artworkUrl || null
    }

    const newBg = artworkUrl || '/default.jpg'
    if (newBg === currentBg) return
    currentBg = newBg

    const img = new Image()
    const loadedUrl = newBg
    img.onload = () => {
      if (currentBg !== loadedUrl) return
      const next = 1 - activeLayer.value
      ;(next === 0 ? layer0 : layer1).value = newBg
      activeLayer.value = next
    }
    img.onerror = () => {
      if (currentBg !== loadedUrl) return
      const next = 1 - activeLayer.value
      ;(next === 0 ? layer0 : layer1).value = newBg
      activeLayer.value = next
    }
    img.src = newBg
  },
  { immediate: true }
)

</script>

<template>
  <div class="bg">
    <div
      ref="bgEl0"
      class="bg-layer"
      :class="{ visible: activeLayer === 0 }"
      :style="{ backgroundImage: `url(${layer0})` }"
    />
    <div
      ref="bgEl1"
      class="bg-layer"
      :class="{ visible: activeLayer === 1 }"
      :style="{ backgroundImage: `url(${layer1})` }"
    />
  </div>

  <Transition name="fade">
    <div v-if="useState.loading" class="loader-overlay">
      <div class="spinner"></div>
    </div>
  </Transition>

  <BurgerMenu />
  <ErrorModal
    :visible="errorModal.state.visible"
    :title="errorModal.state.title"
    :message="errorModal.state.message"
    :details="errorModal.state.details"
    @close="errorModal.hideError"
  />

  <OverlayFilters />
  <Player />
</template>
