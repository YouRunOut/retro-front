import { onMounted, onUnmounted } from 'vue'

export function useIdleTilt(
  getEl: () => HTMLElement | null,
  options?: {
    idleDelay?: number
    intensity?: number
    speed?: number
  }
) {
  const IDLE_DELAY = options?.idleDelay ?? 2000
  const INTENSITY = options?.intensity ?? 3
  const SPEED = options?.speed ?? 0.01

  let isIdle = true
  let idleTimeout: number | null = null
  let rafId: number | null = null
  let t = 0

  function onMouseMove() {
    isIdle = false

    if (idleTimeout) clearTimeout(idleTimeout)

    idleTimeout = window.setTimeout(() => {
      isIdle = true
    }, IDLE_DELAY)
  }

  function animate() {
    const el = getEl()

    if (el && isIdle) {
      t += SPEED

      const rotZ = Math.sin(t) * INTENSITY
      const rotX = Math.sin(t * 0.7) * INTENSITY
      const rotY = Math.cos(t * 0.6) * INTENSITY

      el.style.transform = `
        rotateX(${rotX}deg)
        rotateY(${rotY}deg)
        rotateZ(${rotZ}deg)
      `
        // БЛИК (новое)
      const percentX = 50 + rotY * 1
      const percentY = 50 - rotX * 1
      // // БЛИК
      // const percentX = (x / rect.width) * 10 + 50
      // const percentY = (y / rect.height) * 10 + 50

      el.style.setProperty('--x', `${percentX}%`)
      el.style.setProperty('--y', `${percentY}%`)
      
    }

    rafId = requestAnimationFrame(animate)
  }

  onMounted(() => {
    window.addEventListener('mousemove', onMouseMove)
    animate()
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    if (rafId) cancelAnimationFrame(rafId)
    if (idleTimeout) clearTimeout(idleTimeout)
  })
}
