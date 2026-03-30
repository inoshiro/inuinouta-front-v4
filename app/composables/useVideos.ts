import type { VideoList } from '~/types'

export function useVideos(options?: { perPage?: number }) {
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
    const all = library.allVideos
    if (!search.value) return all
    const q = search.value.toLowerCase()
    return all.filter((v) => v.title.toLowerCase().includes(q))
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
