<script setup lang="ts">
import Dropdown from '../composables/dropdown.vue'
import { useLocale } from '../composables/useLocale'

const { t } = useLocale()

defineProps({
  visible: Boolean,
  title: {
    type: String,
    default: 'Error',
  },
  message: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>



<template>
  <div v-if="visible" class="overlay">
    <div class="modal">
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
        <Dropdown :title="t('common.details')">
            <pre>{{ details }}</pre>
        </Dropdown>
        <button class="modal-close" @click="close">{{ t('common.ok') }}</button>
    </div>
  </div>
</template>