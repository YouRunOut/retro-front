<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const saturate = ref(1.96957)
const brightness = ref(1.03771)
const coverScale = ref(1.69330)
const bgPerspective = ref(800)
const tagGlow = ref(3)

function applyTagFilter() {
  const s = saturate.value
  const b = brightness.value
  const el = document.querySelector<HTMLElement>('.tag-list')
  if (!el) return
  el.style.filter = `saturate(${s}) brightness(${b})`
}

watch([saturate, brightness], applyTagFilter, { immediate: true })

function isMobileViewport() {
  return window.matchMedia('(orientation: portrait) and (max-width: 480px)').matches
      || window.matchMedia('(orientation: landscape) and (max-height: 600px)').matches
}

watch(coverScale, (v) => {
  if (isMobileViewport()) return
  const el = document.querySelector<HTMLElement>('.cover-wrapper')
  if (el) el.style.scale = String(v)
})

watch(tagGlow, (v) => {
  document.documentElement.style.setProperty('--tag-glow-scale', String(v))
})

watch(bgPerspective, (p) => {
  document.documentElement.style.setProperty('--bg-3d', `perspective(${p}px)`)
})

onUnmounted(() => {
  const tagEl = document.querySelector<HTMLElement>('.tag-list')
  if (tagEl) tagEl.style.filter = ''
  document.documentElement.style.removeProperty('--bg-3d')
  const coverEl = document.querySelector<HTMLElement>('.cover-wrapper')
  if (coverEl) coverEl.style.scale = ''
})
</script>

<template>
  <div class="stool" @mousedown.stop>
    <div class="stool-group">
      <label class="stool-label">Saturation <span class="stool-val">{{ saturate.toFixed(5) }}</span></label>
      <input type="range" min="0" max="3" step="0.00001" v-model.number="saturate" />
    </div>
    <div class="stool-group">
      <label class="stool-label">Brightness <span class="stool-val">{{ brightness.toFixed(5) }}</span></label>
      <input type="range" min="0" max="3" step="0.00001" v-model.number="brightness" />
    </div>
    <div class="stool-group">
      <label class="stool-label">Cassette scale <span class="stool-val">{{ coverScale.toFixed(5) }}</span></label>
      <input type="range" min="0.5" max="3" step="0.00001" v-model.number="coverScale" />
    </div>
    <div class="stool-group">
      <label class="stool-label">Tag glow size <span class="stool-val">{{ tagGlow.toFixed(1) }}×</span></label>
      <input type="range" min="0" max="5" step="0.1" v-model.number="tagGlow" />
    </div>
    <div class="stool-group">
      <label class="stool-label">BG perspective <span class="stool-val">{{ bgPerspective }}px</span></label>
      <input type="range" min="100" max="2000" step="10" v-model.number="bgPerspective" />
    </div>
  </div>
</template>

<style scoped>
.stool {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  left: 360px;
  z-index: 100000;
  background: rgba(30, 30, 30, 0.97);
  border: 1px solid rgba(202, 42, 214, 0.3);
  padding: 20px;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  pointer-events: auto;
}
.stool-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stool-label {
  font-size: 14px;
  color: #b0b0b0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stool-val {
  color: #888;
  font-size: 12px;
}
.stool-group input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 0;
  outline: none;
  cursor: pointer;
}
.stool-group input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 0;
  background: #CA2AD6;
  border: none;
  cursor: pointer;
}
.stool-group input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 0;
  background: #CA2AD6;
  border: none;
  cursor: pointer;
}
</style>
