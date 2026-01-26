<script setup lang="ts">
import Dropdown from '../composables/dropdown.vue'

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

      <!-- <details
        v-if="details"
        ref="detailsRef"
        class="modal-details"
        @toggle="onToggle"
    >
        <summary>Details</summary>
        <pre>{{ details }}</pre>
      </details> -->
        
        <Dropdown title="Details">
            <pre>{{ details }}</pre>
        </Dropdown>

      <button class="modal-close" @click="close">OK</button>
    </div>
  </div>
</template>