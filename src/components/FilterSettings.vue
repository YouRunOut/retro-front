<script setup lang="ts">
import { computed } from 'vue'
import { useLocale } from '../composables/useLocale'
import { useOverlayFilter } from '../composables/useOverlayFilter'
import type { OverlayFilter } from '../composables/useOverlayFilter'
import AppSelect from './AppSelect.vue'
import ToggleSwitch from './ToggleSwitch.vue'

const emit = defineEmits<{ back: [] }>()
const { t } = useLocale()
const { activeFilter, setFilter, crtParams, resetCrtParams } = useOverlayFilter()

const filterOptions = computed(() => [
  { value: 'none', label: t('filters.none') },
  { value: 'crt', label: t('filters.crt') },
  { value: 'crt-rgb', label: t('filters.crtRgb') },
])

const corruptionModeOptions = computed(() => [
  { value: 'loop', label: t('filters.corruptionLoop') },
  { value: 'event', label: t('filters.corruptionEvent') },
])

interface SliderDef {
  key: 'scanlinesOpacity' | 'noiseBrightness' | 'vignetteStrength'
      | 'glitchIntensity'
      | 'rgbMasterOpacity' | 'rgbRedIntensity' | 'rgbGreenIntensity' | 'rgbBlueIntensity'
  label: string
  min: number
  max: number
  step: number
}

const crtSliderDefs: SliderDef[] = [
  { key: 'scanlinesOpacity', label: t('filters.scanlines'), min: 0, max: 0.3, step: 0.01 },
  { key: 'noiseBrightness', label: t('filters.noise'), min: 0, max: 0.08, step: 0.001 },
  { key: 'vignetteStrength', label: t('filters.vignette'), min: 0, max: 0.6, step: 0.01 },
  { key: 'glitchIntensity', label: t('filters.glitch'), min: 0, max: 1, step: 0.1 },
]

const rgbSliderDefs: SliderDef[] = [
  { key: 'rgbMasterOpacity', label: 'Opacity', min: 0, max: 1, step: 0.01 },
  { key: 'rgbRedIntensity', label: 'Red', min: 0, max: 0.3, step: 0.01 },
  { key: 'rgbGreenIntensity', label: 'Green', min: 0, max: 0.3, step: 0.01 },
  { key: 'rgbBlueIntensity', label: 'Blue', min: 0, max: 0.3, step: 0.01 },
]
</script>

<template>
  <div class="page">
    <button class="back-btn unselectable" @click="emit('back')"><img class="back-arrow" src="/nav-back-arrow.svg" alt="" /> {{ t('common.back') }}</button>
    <div class="page-content">
      <h3>{{ t('filters.title') }}</h3>

      <div class="settings-group">
        <label class="settings-label checkbox-row unselectable">
          <input type="checkbox" :checked="crtParams.chromaticTextEnabled" @change="crtParams.chromaticTextEnabled = ($event.target as HTMLInputElement).checked" />
          {{ t('filters.chromaticText') }}
        </label>
      </div>
      <div class="settings-group">
        <label class="settings-label checkbox-row unselectable">
          <input type="checkbox" :checked="crtParams.glitchEnabled" @change="crtParams.glitchEnabled = ($event.target as HTMLInputElement).checked" />
          {{ t('filters.glitchText') }}
        </label>
      </div>
      <div class="settings-group">
        <label class="settings-label checkbox-row unselectable">
          <input type="checkbox" :checked="crtParams.corruptionEnabled" @change="crtParams.corruptionEnabled = ($event.target as HTMLInputElement).checked" />
          {{ t('filters.corruptionBlocks') }}
        </label>
      </div>
      <div v-if="crtParams.corruptionEnabled" class="settings-group">
        <label class="settings-label unselectable">{{ t('filters.corruptionMode') }}</label>
        <ToggleSwitch
          :model-value="crtParams.corruptionMode"
          :options="corruptionModeOptions"
          @update:model-value="crtParams.corruptionMode = $event as 'loop' | 'event'"
        />
      </div>
      <hr class="separator" />

      <div class="settings-group">
        <label class="settings-label unselectable">{{ t('filters.title') }}</label>
        <AppSelect
          :model-value="activeFilter"
          :options="filterOptions"
          @update:model-value="(v: string) => setFilter(v as OverlayFilter)"
        />
      </div>

      <template v-if="activeFilter === 'crt'">
        <div
          v-for="d in crtSliderDefs"
          :key="d.key"
          class="settings-group"
        >
          <label class="settings-label unselectable">{{ d.label }} <span class="slider-value">{{ crtParams[d.key] }}</span></label>
          <input
            type="range"
            :min="d.min"
            :max="d.max"
            :step="d.step"
            :value="crtParams[d.key]"
            @input="crtParams[d.key] = parseFloat(($event.target as HTMLInputElement).value)"
          />
        </div>
      </template>

      <template v-if="activeFilter === 'crt-rgb'">
        <div
          v-for="d in rgbSliderDefs"
          :key="d.key"
          class="settings-group"
        >
          <label class="settings-label unselectable">{{ d.label }} <span class="slider-value">{{ crtParams[d.key] }}</span></label>
          <input
            type="range"
            :min="d.min"
            :max="d.max"
            :step="d.step"
            :value="crtParams[d.key]"
            @input="crtParams[d.key] = parseFloat(($event.target as HTMLInputElement).value)"
          />
        </div>
      </template>

      <div class="settings-group">
        <button class="action-btn reset-btn unselectable" @click="resetCrtParams">
          {{ t('menu.reset') }}
        </button>
      </div>
    </div>
  </div>
</template>
