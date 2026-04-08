import type { Ref } from 'vue'
import type { Song, VideoList } from '~/types'

const SONG_LIMIT = 5
const VIDEO_LIMIT = 5

export function useSearchDropdown(query: Ref<string>) {
  const library = useLibraryStore()
  const isFocused = ref(false)

  const isDropdownVisible = computed(
    () => import.meta.client && isFocused.value && query.value.trim().length >= 1,
  )

  const dropdownSongs = computed<Song[]>(() => {
    if (!isDropdownVisible.value) return []
    const q = normalizeSearch(query.value)
    return library.allSongs
      .filter(
        (s) =>
          normalizeSearch(s.title).includes(q) ||
          (s.artist != null && normalizeSearch(s.artist).includes(q)),
      )
      .slice(0, SONG_LIMIT)
  })

  const dropdownVideos = computed<VideoList[]>(() => {
    if (!isDropdownVisible.value) return []
    const q = normalizeSearch(query.value)

    const matchedByContent = new Set(
      library.allSongs
        .filter(
          (s) =>
            normalizeSearch(s.title).includes(q) ||
            (s.artist != null && normalizeSearch(s.artist).includes(q)),
        )
        .map((s) => s.video.id),
    )

    return library.allVideos
      .filter((v) => normalizeSearch(v.title).includes(q) || matchedByContent.has(v.id))
      .slice(0, VIDEO_LIMIT)
  })

  const hasSongs = computed(() => dropdownSongs.value.length > 0)
  const hasVideos = computed(() => dropdownVideos.value.length > 0)
  const isEmpty = computed(() => isDropdownVisible.value && !hasSongs.value && !hasVideos.value)

  // Lock page scroll on mobile when search is focused to prevent background scrolling
  watch(isFocused, (focused) => {
    if (!import.meta.client) return
    if (window.innerWidth >= 1024) return
    document.body.style.overflow = focused ? 'hidden' : ''
  })

  // Release scroll lock when viewport grows to desktop width (e.g. device rotation)
  function onWindowResize() {
    if (window.innerWidth >= 1024 && document.body.style.overflow === 'hidden') {
      document.body.style.overflow = ''
    }
  }

  onMounted(() => {
    window.addEventListener('resize', onWindowResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', onWindowResize)
    if (import.meta.client) {
      document.body.style.overflow = ''
    }
  })

  function onFocus() {
    isFocused.value = true
  }

  function onBlur() {
    // Delay to allow click events inside the dropdown to fire first
    setTimeout(() => {
      isFocused.value = false
    }, 150)
  }

  function close() {
    isFocused.value = false
  }

  return {
    isSearchActive: isFocused,
    isDropdownVisible,
    dropdownSongs,
    dropdownVideos,
    hasSongs,
    hasVideos,
    isEmpty,
    onFocus,
    onBlur,
    close,
  }
}
