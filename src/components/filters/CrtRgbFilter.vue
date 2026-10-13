<template>
  <div
    class="crt-rgb-overlay"
    :style="rgbVars"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useOverlayFilter } from '../../composables/useOverlayFilter'
import '../../styles/filters/crt-rgb.css'

const { crtParams } = useOverlayFilter()

const rgbVars = computed(() => ({
  '--rgb-r-intensity': String(crtParams.rgbRedIntensity),
  '--rgb-g-intensity': String(crtParams.rgbGreenIntensity),
  '--rgb-b-intensity': String(crtParams.rgbBlueIntensity),
  '--rgb-master-opacity': String(crtParams.rgbMasterOpacity),
}))
</script>
