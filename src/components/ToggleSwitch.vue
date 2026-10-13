<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  options: {
    value: string
    label: string
    disabled?: boolean
    badge?: string
  }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const activeIndex = computed(() =>
  props.options.findIndex(o => o.value === props.modelValue)
)

function select(opt: { value: string; disabled?: boolean }) {
  if (opt.disabled) return
  emit('update:modelValue', opt.value)
}
</script>

<template>
  <div class="toggle-switch">
    <div
      class="toggle-track"
      :class="{
        'track-left-active': activeIndex === 0,
        'track-right-active': activeIndex === options.length - 1,
      }"
    >
      <div
        class="toggle-slider"
        :style="{
          width: `${100 / options.length}%`,
          transform: `translateX(${options.findIndex(o => o.value === modelValue) * 100}%)`,
        }"
      />
      <button
        v-for="opt in options"
        :key="opt.value"
        class="toggle-option"
        :class="{
          active: opt.value === modelValue,
          disabled: opt.disabled,
        }"
        @click="select(opt)"
      >
        {{ opt.label }}
        <span v-if="opt.badge" class="toggle-badge">{{ opt.badge }}</span>
      </button>
    </div>
  </div>
</template>
