import type { Ref } from 'vue'
import type { Song, VideoList } from '~/types'

const SONG_LIMIT = 5
const VIDEO_LIMIT = 5

/** Normalize katakana → hiragana for case-insensitive kana matching */
function toHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
}

function normalize(str: string): string {
  return toHiragana(str.toLowerCase())
}

export function useSearchDropdown(query: Ref<string>) {
  const library = useLibraryStore()
  const isFocused = ref(false)

  const isDropdownVisible = computed(
    () => import.meta.client && isFocused.value && query.value.trim().length >= 2,
  )

  const dropdownSongs = computed<Song[]>(() => {
    if (!isDropdownVisible.value) return []
    const q = normalize(query.value)
    return library.allSongs
      .filter(
        (s) =>
          normalize(s.title).includes(q) || (s.artist != null && normalize(s.artist).includes(q)),
      )
      .slice(0, SONG_LIMIT)
  })

  const dropdownVideos = computed<VideoList[]>(() => {
    if (!isDropdownVisible.value) return []
    const q = normalize(query.value)

    const matchedByContent = new Set(
      library.allSongs
        .filter(
          (s) =>
            normalize(s.title).includes(q) || (s.artist != null && normalize(s.artist).includes(q)),
        )
        .map((s) => s.video.id),
    )

    return library.allVideos
      .filter((v) => normalize(v.title).includes(q) || matchedByContent.has(v.id))
      .slice(0, VIDEO_LIMIT)
  })

  const hasSongs = computed(() => dropdownSongs.value.length > 0)
  const hasVideos = computed(() => dropdownVideos.value.length > 0)
  const isEmpty = computed(() => isDropdownVisible.value && !hasSongs.value && !hasVideos.value)

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
