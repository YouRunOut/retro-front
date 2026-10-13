<template>
  <div />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import '../../styles/filters/crt-chromatic.css'

const CLASS = 'crt-chromatic'

onMounted(() => {
  document.documentElement.classList.add(CLASS)
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove(CLASS)
})
</script>
