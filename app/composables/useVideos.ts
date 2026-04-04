import type { VideoList } from '~/types'

export function useVideos(options?: { perPage?: number; streamOnly?: boolean }) {
  const library = useLibraryStore()
  const route = useRoute()
  const page = ref(1)
  const perPage = options?.perPage ?? 30
  const search = ref('')

  const status = computed(() =>
    library.videosStatus === 'idle' ? 'pending' : library.videosStatus,
  )
  const error = computed(() => library.videosError)

  const filtered = computed<VideoList[]>(() => {
    const base = options?.streamOnly
      ? library.allVideos.filter((v) => v.is_stream)
      : library.allVideos
    if (!search.value) return base
    const q = search.value.toLowerCase()

    // Collect video IDs where any contained song matches by title or artist
    const matchedByContent = new Set(
      library.allSongs
        .filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            (s.artist != null && s.artist.toLowerCase().includes(q)),
        )
        .map((s) => s.video.id),
    )

    return base.filter((v) => v.title.toLowerCase().includes(q) || matchedByContent.has(v.id))
  })

  const totalItems = computed(() => filtered.value.length)

  const videos = computed(() => {
    const start = (page.value - 1) * perPage
    return filtered.value.slice(start, start + perPage)
  })

  // Reset page when search changes
  watch(search, () => {
    page.value = 1
  })

  // Sync search from URL query ?q=
  watch(
    () => route.query.q,
    (q) => {
      search.value = typeof q === 'string' ? q : ''
    },
    { immediate: true },
  )

  // SSR prefetch: when directly loading a page that uses this composable
  onServerPrefetch(() => callOnce('library-videos', () => library.fetchVideos()))

  // Client-side preload is handled by default.vue layout (runs on every page).
  // This fallback ensures data is available if the composable is used
  // outside a context where the layout has already triggered the preload.
  if (import.meta.client && library.videosStatus === 'idle') {
    void callOnce('library-videos', () => library.fetchVideos())
  }

  function refresh() {
    return library.fetchVideos(true)
  }

  return { videos, totalItems, page, perPage, search, status, error, refresh }
}
