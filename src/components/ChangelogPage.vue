<script setup lang="ts">
import { useLocale } from '../composables/useLocale'
import { changelog } from '../data/changelog'

const emit = defineEmits<{ back: [] }>()
const { t, language } = useLocale()
</script>

<template>
  <div class="page">
    <button class="back-btn unselectable" @click="emit('back')"><img class="back-arrow" src="/nav-back-arrow.svg" alt="" /> {{ t('common.back') }}</button>
    <div class="page-content">
      <h3>{{ t('menu.changelog') }}</h3>

      <div v-for="entry in changelog" :key="entry.version" class="changelog-entry">
        <p class="version">v{{ entry.version }} — {{ entry.date }}</p>
        <ul class="changelog-list">
          <li v-for="(change, i) in entry.changes" :key="i">{{ change[language] }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
