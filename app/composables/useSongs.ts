import type { Song } from '~/types'

export type SongTypeFilter = '' | 'original' | 'cover'
export type VideoTypeFilter = '' | 'music_video' | 'stream'

export function useSongs(options?: { perPage?: number }) {
  const library = useLibraryStore()
  const route = useRoute()
  const page = ref(1)
  const perPage = options?.perPage ?? 30
  const search = ref('')
  const songType = ref<SongTypeFilter>('')
  const videoType = ref<VideoTypeFilter>('')

  const status = computed(() => (library.songsStatus === 'idle' ? 'pending' : library.songsStatus))
  const error = computed(() => library.songsError)

  const filtered = computed<Song[]>(() => {
    const all = library.allSongs
    const q = search.value.toLowerCase()
    const st = songType.value
    const vt = videoType.value
    return all.filter((s) => {
      const matchText =
        !q ||
        s.title.toLowerCase().includes(q) ||
        (s.artist != null && s.artist.toLowerCase().includes(q))
      const matchSongType = st === '' || (st === 'original' ? s.is_original : !s.is_original)
      const matchVideoType = vt === '' || (vt === 'stream' ? s.video.is_stream : !s.video.is_stream)
      return matchText && matchSongType && matchVideoType
    })
  })

  const totalItems = computed(() => filtered.value.length)

  const songs = computed(() => {
    const start = (page.value - 1) * perPage
    return filtered.value.slice(start, start + perPage)
  })

  // Reset page when any filter changes
  watch([search, songType, videoType], () => {
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
  onServerPrefetch(() => callOnce('library-songs', () => library.fetchSongs()))

  // Client-side preload is handled by default.vue layout (runs on every page).
  // This fallback ensures data is available if the composable is used
  // outside a context where the layout has already triggered the preload.
  if (import.meta.client && library.songsStatus === 'idle') {
    void callOnce('library-songs', () => library.fetchSongs())
  }

  function refresh() {
    return library.fetchSongs(true)
  }

  return { songs, totalItems, page, perPage, search, songType, videoType, status, error, refresh }
}
