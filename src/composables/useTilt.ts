import { onMounted, onBeforeUnmount } from 'vue'

const INTENSITY = 6
const IDLE_DELAY = 2000
const IDLE_INTENSITY = 3
const IDLE_SPEED = 0.02
const BLEND_DURATION = 800

export function useTilt(target: () => HTMLElement | null) {
  let isIdle = true
  let idleTimeout: number | null = null
  let rafId: number | null = null
  let t = 0

  let curRX = 0
  let curRY = 0
  let curRZ = 0
  let targetRX = 0
  let targetRY = 0
  let targetRZ = 0

  let blending = false
  let blendStart = 0
  let blendFromRX = 0
  let blendFromRY = 0
  let blendFromRZ = 0

  function onMouseMove(e: MouseEvent) {
    const el = target()
    if (!el) return

    const targetEl = e.target as HTMLElement
    if (targetEl.closest('.stool')) return

    const rect = el.getBoundingClientRect()
    const x = e.clientX - (rect.left + rect.width / 2)
    const y = e.clientY - (rect.top + rect.height / 2)

    targetRX = -(y / rect.height) * INTENSITY
    targetRY = (x / rect.width) * INTENSITY
    targetRZ = 0

    const px = (x / rect.width) * 10 + 50
    const py = (y / rect.height) * 10 + 50
    el.style.setProperty('--x', `${px}%`)
    el.style.setProperty('--y', `${py}%`)

    if (isIdle) {
      blending = true
      blendStart = performance.now()
      blendFromRX = curRX
      blendFromRY = curRY
      blendFromRZ = curRZ
      isIdle = false
    }

    if (idleTimeout) clearTimeout(idleTimeout)
    idleTimeout = window.setTimeout(() => {
      blending = true
      blendStart = performance.now()
      blendFromRX = curRX
      blendFromRY = curRY
      blendFromRZ = curRZ
      isIdle = true
      t = 0
    }, IDLE_DELAY)
  }

  function animate(now: DOMHighResTimeStamp) {
    const el = target()
    if (!el) { rafId = requestAnimationFrame(animate); return }

    if (isIdle) {
      t += IDLE_SPEED
      targetRX = Math.sin(t * 0.7) * IDLE_INTENSITY
      targetRY = Math.cos(t * 0.6) * IDLE_INTENSITY
      targetRZ = Math.sin(t) * IDLE_INTENSITY

      const px = 50 + targetRY * 1
      const py = 50 - targetRX * 1
      el.style.setProperty('--x', `${px}%`)
      el.style.setProperty('--y', `${py}%`)
    }

    if (blending) {
      let p = (now - blendStart) / BLEND_DURATION
      if (p >= 1) { p = 1; blending = false }
      const ease = 1 - Math.pow(1 - p, 3)

      curRX = blendFromRX + (targetRX - blendFromRX) * ease
      curRY = blendFromRY + (targetRY - blendFromRY) * ease
      curRZ = blendFromRZ + (targetRZ - blendFromRZ) * ease
    } else {
      curRX = targetRX
      curRY = targetRY
      curRZ = targetRZ
    }

    el.style.transform = `rotateX(${curRX}deg) rotateY(${curRY}deg) rotateZ(${curRZ}deg)`

    rafId = requestAnimationFrame(animate)
  }

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    animate(performance.now())
  })

  onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMouseMove)
    if (rafId) cancelAnimationFrame(rafId)
    if (idleTimeout) clearTimeout(idleTimeout)
  })
}
