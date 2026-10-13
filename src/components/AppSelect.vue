<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface Option {
  value: string
  label: string
  disabled?: boolean
  badge?: string
  fontFamily?: string
}

const props = defineProps<{
  modelValue: string
  options: Option[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const elRef = ref<HTMLElement | null>(null)

const selectedOption = computed(() =>
  props.options.find(o => o.value === props.modelValue) ?? null
)

const selectedLabel = computed(() =>
  selectedOption.value?.label ?? ''
)

function toggle() {
  open.value = !open.value
}

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (open.value && elRef.value && !elRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
</script>

<template>
  <div class="app-select" ref="elRef">
    <button
      class="app-select-trigger unselectable"
      :class="{ open }"
      :style="selectedOption?.fontFamily ? { fontFamily: selectedOption.fontFamily } : undefined"
      @click="toggle"
    >
      {{ selectedLabel }}
      <span class="app-select-arrow"></span>
    </button>
    <Transition name="drop">
      <ul v-if="open" class="app-select-options unselectable">
        <li
          v-for="opt in options"
          :key="opt.value"
          tabindex="0"
          class="app-select-option"
          :class="{ selected: opt.value === modelValue, disabled: opt.disabled }"
          :style="opt.fontFamily ? { fontFamily: opt.fontFamily } : undefined"
          @click="!opt.disabled && select(opt.value)"
          @keydown.enter.prevent="!opt.disabled && select(opt.value)"
          @keydown.space.prevent="!opt.disabled && select(opt.value)"
        >
          {{ opt.label }}
          <span v-if="opt.badge" class="app-select-badge">{{ opt.badge }}</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>
