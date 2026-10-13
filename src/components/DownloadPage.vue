<script setup lang="ts">
import { useLocale } from '../composables/useLocale'

const emit = defineEmits<{ back: [] }>()
const { t } = useLocale()
</script>

<template>
  <div class="page">
    <button class="back-btn unselectable" @click="emit('back')"><img class="back-arrow" src="/nav-back-arrow.svg" alt="" /> {{ t('common.back') }}</button>
    <div class="page-content">
      <h3>{{ t('download.mobile_title') }}</h3>
      <ul class="links">
        <li><a class="with-icon unselectable" href="https://www.rustore.ru/catalog/app/com.senior.rwrfinal" target="_blank" rel="noopener"><img src="/page_icon/rustore-icon.svg" alt="RuStore">{{ t('download.link') }}</a></li>
      </ul>
    </div>
  </div>
</template>
