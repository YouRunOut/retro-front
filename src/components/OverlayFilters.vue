<template>
  <CrtFilter v-if="activeFilter === 'crt'" />
  <CrtRgbFilter v-else-if="activeFilter === 'crt-rgb'" />
  <CrtChromaticFilter v-if="crtParams.chromaticTextEnabled" />
  <CrtGlitchFilter v-if="crtParams.glitchEnabled" />
  <CrtCorruptionFilter v-if="crtParams.corruptionEnabled" />
</template>

<script setup lang="ts">
import { useOverlayFilter } from '../composables/useOverlayFilter'
import CrtFilter from './filters/CrtFilter.vue'
import CrtRgbFilter from './filters/CrtRgbFilter.vue'
import CrtChromaticFilter from './filters/CrtChromaticFilter.vue'
import CrtGlitchFilter from './filters/CrtGlitchFilter.vue'
import CrtCorruptionFilter from './filters/CrtCorruptionFilter.vue'

const { activeFilter, crtParams } = useOverlayFilter()
</script>
