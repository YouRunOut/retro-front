<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useLocale } from '../composables/useLocale'
import { useState, fontOptions } from '../core/store'
import { setState } from '../core/store'
import AppSelect from './AppSelect.vue'

const emit = defineEmits<{ back: []; navigate: [page: string] }>()

const { t, setLanguage, language } = useLocale()

const COVER_SCALE_KEY = 'coverScale'
const savedScale = localStorage.getItem(COVER_SCALE_KEY)
const coverScale = ref(savedScale !== null ? Number(savedScale) : 1.6)

function isMobileViewport() {
  return window.matchMedia('(orientation: portrait) and (max-width: 480px)').matches
      || window.matchMedia('(orientation: landscape) and (max-height: 600px)').matches
}

function applyCoverScale(v: number) {
  if (isMobileViewport()) return
  const el = document.querySelector<HTMLElement>('.cover-wrapper')
  if (el) el.style.scale = String(v)
}

watch(coverScale, (v) => {
  applyCoverScale(v)
  localStorage.setItem(COVER_SCALE_KEY, String(v))
})

onMounted(() => {
  applyCoverScale(coverScale.value)
})

const TICK_VALUES = [1.0, 1.5, 1.6, 2.0]
const SNAP_RANGE = 0.015
const BREAK_FREE = 0.025
let snappedTick: number | null = null

function onCoverScaleInput(e: Event) {
  const input = e.target as HTMLInputElement
  const raw = parseFloat(input.value)

  if (snappedTick !== null) {
    if (Math.abs(raw - snappedTick) > BREAK_FREE) {
      snappedTick = null
      coverScale.value = raw
    } else {
      input.value = String(snappedTick)
      coverScale.value = snappedTick
    }
    return
  }

  const nearest = TICK_VALUES.reduce((prev, curr) =>
    Math.abs(curr - raw) < Math.abs(prev - raw) ? curr : prev
  )

  if (Math.abs(nearest - raw) < SNAP_RANGE) {
    snappedTick = nearest
    input.value = String(nearest)
    coverScale.value = nearest
  } else {
    coverScale.value = raw
  }
}

const langOptions = computed(() => [
  { value: 'ru', label: t('settings.ru') },
  { value: 'en', label: t('settings.en') },
])

const fontSelectOptions = computed(() =>
  fontOptions.map(f => ({
    value: f.value,
    label: f.label,
    fontFamily: f.value,
  }))
)

function onLanguageChange(value: string) {
  setLanguage(value as 'ru' | 'en')
}

function onFontChange(value: string) {
  setState({ currentFont: value })
}
</script>

<template>
  <div class="page">
    <button class="back-btn unselectable" @click="emit('back')"><img class="back-arrow" src="/nav-back-arrow.svg" alt="" /> {{ t('common.back') }}</button>
    <div class="page-content">
      <h3>{{ t('settings.title') }}</h3>
      <div class="settings-group">
        <button class="filters-link unselectable" @click="emit('navigate', 'filters')">
          {{ t('settings.filters') }}
        </button>
      </div>
      <hr class="separator" />
      <div class="settings-group">
        <label class="settings-label">{{ t('settings.language') }}</label>
        <AppSelect
          :model-value="language"
          :options="langOptions"
          @update:model-value="onLanguageChange"
        />
      </div>
      <div class="settings-group">
        <label class="settings-label">{{ t('settings.font') }}</label>
        <AppSelect
          :model-value="useState.currentFont"
          :options="fontSelectOptions"
          @update:model-value="onFontChange"
        />
      </div>
      <div class="settings-group">
        <label class="settings-label unselectable">{{ t('settings.coverScale') }} <span class="slider-value">{{ coverScale.toFixed(2) }}</span></label>
        <div class="slider-with-ticks">
          <input
            type="range"
            min="1.0"
            max="2"
            step="0.01"
            :value="coverScale"
            @input="onCoverScaleInput"
          />
        </div>
      </div>
    </div>
  </div>
</template>
