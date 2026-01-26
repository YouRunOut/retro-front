import { reactive } from 'vue'

const state = reactive({
  visible: false,
  title: 'Error',
  message: '',
  details: '',
})

export function useErrorModal() {
  function showError(payload: {
    message: string
    title?: string
    details?: string
  }) {
    state.visible = true
    state.title = payload.title ?? 'Error'
    state.message = payload.message
    state.details = payload.details ?? ''
  }

  function hideError() {
    state.visible = false
  }

  return { state, showError, hideError }
}
