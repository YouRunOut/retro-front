import { onMounted, onBeforeUnmount } from 'vue'

export function useStableHeight() {
  function fixHeight(h: number) {
    document.documentElement.style.setProperty('--app-height', `${h}px`)
  }

  function onResize() {
    const vv = window.visualViewport
    if (vv) {
      const inset = window.innerHeight - vv.height
      if (inset > 0) return
    }
    fixHeight(window.innerHeight)
  }

  onMounted(() => {
    fixHeight(window.innerHeight)
    window.visualViewport?.addEventListener('resize', onResize)
    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    window.visualViewport?.removeEventListener('resize', onResize)
    window.removeEventListener('resize', onResize)
  })
}
