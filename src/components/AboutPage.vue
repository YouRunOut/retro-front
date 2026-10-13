<script setup lang="ts">
import { useLocale } from '../composables/useLocale'
import { changelog } from '../data/changelog'

const emit = defineEmits<{ back: [] }>()
const { t } = useLocale()
const latest = changelog[0]
</script>

<template>
  <div class="page">
    <button class="back-btn unselectable" @click="emit('back')"><img class="back-arrow" src="/nav-back-arrow.svg" alt="" /> {{ t('common.back') }}</button>
    <div class="page-content">
      <h3>{{ t('about.title') }}</h3>
      <p>{{ t('about.description') }}</p>
      <p class="version">Beta v{{ latest.version }} (WIP)</p>
    </div>
  </div>
</template>
