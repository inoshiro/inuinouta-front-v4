/**
 * Manages the open/close state of the mobile now-playing overlay.
 *
 * Uses a route query parameter `?nowplaying=1` so that browser-back
 * closes the overlay and returns to the previous page naturally.
 */
export function useMobileNowPlayingOverlay() {
  const route = useRoute()
  const router = useRouter()

  const isOpen = computed(() => route.query.nowplaying === '1')

  function open() {
    if (isOpen.value) return
    router.push({ query: { ...route.query, nowplaying: '1' } })
  }

  function close() {
    if (!isOpen.value) return
    // Prefer router.back() so the user returns to the previous page.
    // If there is no history (e.g. direct URL access), fall back to
    // removing the query param from the current route.
    if (window.history.length > 1) {
      router.back()
    } else {
      const query = { ...route.query }
      delete query.nowplaying
      router.replace({ query })
    }
  }

  return { isOpen, open, close }
}
