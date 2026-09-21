/**
 * Manages the open/close state of the PC-only full-area video layer.
 *
 * Module-level singleton state: persists across page navigation but resets
 * on full reload, since the layer is a transient UI state (not playback
 * state, so it does not belong in the player store).
 */
const isOpen = ref(false)

export function useDesktopPlayerPanel() {
  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  return {
    isOpen: readonly(isOpen),
    open,
    close,
    toggle,
  }
}
