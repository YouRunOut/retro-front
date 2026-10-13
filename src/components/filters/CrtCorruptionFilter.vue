<template>
  <div v-if="blocks.length">
    <div
      v-for="b in blocks"
      :key="b.id"
      class="corruption-block"
      :class="{ active: b.active }"
      :style="getBlockStyle(b)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useOverlayFilter } from '../../composables/useOverlayFilter'
import '../../styles/filters/crt-corruption.css'

const COLORS = ['#CA2AD6', '#b82ad6', '#a82ad6']

interface Block {
  id: number
  width: number
  height: number
  top: number
  left: number
  color: string
  active: boolean
}

const blocks = ref<Block[]>([])
const { crtParams, corruptionTrigger } = useOverlayFilter()

let triggerTimer: ReturnType<typeof setTimeout> | null = null
let loopRecurTimer: ReturnType<typeof setTimeout> | null = null

function randomizeBlock(b: Block) {
  b.width = 10 + Math.random() * 150
  b.height = 1 + Math.random() * 30
  b.top = Math.random() * 100
  b.left = Math.random() * 100
  b.color = COLORS[Math.floor(Math.random() * COLORS.length)]
}

function generateBlocks() {
  const arr: Block[] = []
  for (let i = 0; i < 10; i++) {
    arr.push({ id: i, width: 0, height: 0, top: 0, left: 0, color: COLORS[0], active: false })
    randomizeBlock(arr[i])
  }
  blocks.value = arr
}

function getBlockStyle(b: Block) {
  return {
    width: b.width + 'px',
    height: b.height + 'px',
    top: b.top + '%',
    left: b.left + '%',
    background: b.color,
  }
}

function trigger() {
  blocks.value.forEach(b => { b.active = false })
  const count = 3 + Math.floor(Math.random() * 4)
  const indices = [...Array(blocks.value.length).keys()].sort(() => Math.random() - 0.5).slice(0, count)
  indices.forEach(i => randomizeBlock(blocks.value[i]))
  nextTick(() => {
    indices.forEach(i => { blocks.value[i].active = true })
    if (triggerTimer !== null) clearTimeout(triggerTimer)
    triggerTimer = setTimeout(() => {
      indices.forEach(i => { blocks.value[i].active = false })
    }, 400)
  })
}

corruptionTrigger.value = trigger

function onMouseOver(e: MouseEvent) {
  const target = e.target as HTMLElement
  const selectors = '.back-btn, .filters-link, .reset-btn, .reset-tags-btn, .confirm-btn, .toggle-option, .tag-btn, .app-select-trigger, .menu-panel a'
  if (target.closest(selectors)) trigger()
}

function attachEvents() {
  if (crtParams.corruptionMode === 'event') {
    document.addEventListener('mouseover', onMouseOver, true)
  }
}

function detachEvents() {
  document.removeEventListener('mouseover', onMouseOver, true)
  if (triggerTimer !== null) {
    clearTimeout(triggerTimer)
    triggerTimer = null
  }
}

function loopTick() {
  trigger()
  loopRecurTimer = setTimeout(loopTick, 3000 + Math.random() * 2000)
}

function attachLoopRecur() {
  if (crtParams.corruptionMode === 'loop') {
    loopRecurTimer = setTimeout(loopTick, 1000 + Math.random() * 2000)
  }
}

function detachLoopRecur() {
  if (loopRecurTimer !== null) {
    clearTimeout(loopRecurTimer)
    loopRecurTimer = null
  }
}

watch(() => crtParams.corruptionMode, (mode) => {
  blocks.value.forEach(b => { b.active = false })
  detachEvents()
  detachLoopRecur()
  if (mode === 'event') attachEvents()
  if (mode === 'loop') attachLoopRecur()
})

onMounted(() => {
  generateBlocks()
  attachEvents()
  attachLoopRecur()
})

onBeforeUnmount(() => {
  corruptionTrigger.value = null
  detachEvents()
  detachLoopRecur()
})
</script>
