<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'

interface Props {
  title?: string
}

const props = defineProps<Props>()
const open = ref(false)
const contentRef = ref<HTMLDivElement | null>(null)
const contentHeight = ref(0)

function toggle() {
  open.value = !open.value
}

watch(open, async (val) => {
  if (val) {
    await nextTick()
    if (contentRef.value) {
      contentHeight.value = contentRef.value.scrollHeight
    }
  } else {
    contentHeight.value = 0
  }
})
</script>



<template>
  <div class="dropdown">
    <button class="dropdown-summary unselectable" @click="toggle">
        <span class="arrow" :class="{ open }">▸</span>
        <slot name="summary">{{ title }}</slot>
    </button>
    <div
      class="dropdown-content"
      :style="{ maxHeight: open ? contentHeight + 'px' : '0' }"
      ref="contentRef"
    >
      <slot />
    </div>
  </div>
</template>



