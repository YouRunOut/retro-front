import { onMounted, onBeforeUnmount } from 'vue'

export function useSafeBottom() {
  function update() {
    const vv = window.visualViewport
    if (!vv) return
    const inset = window.innerHeight - vv.height
    if (inset > 0) {
      document.documentElement.style.setProperty('--safe-bottom', `${inset}px`)
    }
  }

  onMounted(() => {
    update()
    window.visualViewport?.addEventListener('resize', update)
  })

  onBeforeUnmount(() => {
    window.visualViewport?.removeEventListener('resize', update)
  })
}
