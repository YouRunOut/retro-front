import { onMounted, onBeforeUnmount } from 'vue'

let isIdle = true
let idleTimeout: number | null = null

const IDLE_DELAY = 2000 // через сколько мс без движения включать idle
const INTENSITY = 3 // насколько сильно наклонять

export function useTilt(target: () => HTMLElement | null) {
  function onMouseMove(e: MouseEvent) {
    const el = target()
    if (!el) return

    const rect = el.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)

    const rx = -(y / rect.height) * INTENSITY
    const ry = (x / rect.width) * INTENSITY

    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`

    // БЛИК
    const percentX = (x / rect.width) * 10 + 50
    const percentY = (y / rect.height) * 10 + 50

    el.style.setProperty('--x', `${percentX}%`)
    el.style.setProperty('--y', `${percentY}%`)
  }

  function reset() {
    const el = target()
    if (!el) return
    el.style.transform = 'rotateX(0deg) rotateY(0deg)'
  }

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', reset)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseleave', reset)
  })
}
