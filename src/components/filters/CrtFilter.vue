<template>
  <div
    class="crt-overlay"
    :style="overlayVars"
    aria-hidden="true"
  >
    <div class="crt-scanlines" />
    <div class="crt-noise-bg" />
    <div class="crt-vignette" />
    <div class="crt-glitch">
      <div
        v-for="band in bands"
        :key="band.id"
        class="crt-glitch-band"
        :style="band.style"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useOverlayFilter } from '../../composables/useOverlayFilter'
import '../../styles/filters/crt.css'

const { crtParams } = useOverlayFilter()

function rnd(from: number, to: number) {
  return from + Math.random() * (to - from)
}

const overlayVars = computed(() => ({
  '--crt-scanlines-opacity': String(crtParams.scanlinesOpacity),
  '--crt-noise-brightness': String(crtParams.noiseBrightness),
  '--crt-vignette-strength': String(crtParams.vignetteStrength),
}))

interface Band {
  id: number
  style: Record<string, string>
}

const bands = ref<Band[]>([])

function initBands() {
  const intensity = crtParams.glitchIntensity
  const count = Math.max(1, Math.floor(rnd(1, 3) * intensity))
  bands.value = Array.from({ length: count }, (_, i) => ({
    id: Date.now() + i + Math.random(),
    style: {
      '--glitch-top': `${rnd(5, 95)}%`,
      '--glitch-duration': `${rnd(0.5, 1)}s`,
      '--glitch-delay': `${rnd(0, 0.2)}s`,
    },
  }))
}

let glitchTimer: ReturnType<typeof setInterval>

onMounted(() => {
  initBands()
  const interval = Math.max(2000, 8000 - crtParams.glitchIntensity * 4000)
  glitchTimer = setInterval(initBands, interval)
})

onBeforeUnmount(() => {
  clearInterval(glitchTimer)
})
</script>
