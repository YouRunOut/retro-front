<script setup lang="ts">
import { useLocale } from '../composables/useLocale'

const emit = defineEmits<{ back: [] }>()
const { t } = useLocale()
</script>

<template>
  <div class="page">
    <button class="back-btn unselectable" @click="emit('back')"><img class="back-arrow" src="/nav-back-arrow.svg" alt="" /> {{ t('common.back') }}</button>
    <div class="page-content">
      <h3>{{ t('contacts.title') }}</h3>
      <p>{{ t('contacts.subtitle') }}</p>
      <ul class="links">
        <li><a class="unselectable" href="mailto:admin@retrowave-radio.ru" target="_blank" rel="noopener">{{ t('contacts.email') }}</a></li>
      </ul>
      <h3 class="donation_label">{{ t('contacts.support') }}</h3>
      <ul class="links">
        <li><a class="unselectable" href="https://www.donationalerts.com/r/senior_junior" target="_blank" rel="noopener">{{ t('contacts.buyCoffee') }}</a></li>
      </ul>
    </div>
  </div>
</template>
