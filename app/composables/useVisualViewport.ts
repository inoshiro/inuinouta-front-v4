/**
 * Tracks window.visualViewport.height to get the actual visible area height.
 * On iOS Safari, this correctly reflects the height excluding the software keyboard.
 * Falls back to window.innerHeight when visualViewport API is not supported.
 */
export function useVisualViewport() {
  const viewportHeight = ref(0)

  function update() {
    if (typeof window === 'undefined') return
    viewportHeight.value = window.visualViewport ? window.visualViewport.height : window.innerHeight
  }

  onMounted(() => {
    update()
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', update)
      window.visualViewport.addEventListener('scroll', update)
    } else {
      window.addEventListener('resize', update)
    }
  })

  onUnmounted(() => {
    if (typeof window === 'undefined') return
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', update)
      window.visualViewport.removeEventListener('scroll', update)
    } else {
      window.removeEventListener('resize', update)
    }
  })

  return { viewportHeight }
}
