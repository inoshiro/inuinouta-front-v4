import type { Song } from '~/types'

export function useSongs(options?: { perPage?: number }) {
  const library = useLibraryStore()
  const page = ref(1)
  const perPage = options?.perPage ?? 30
  const search = ref('')

  const status = computed(() => (library.songsStatus === 'idle' ? 'pending' : library.songsStatus))
  const error = computed(() => library.songsError)

  const filtered = computed<Song[]>(() => {
    const all = library.allSongs
    if (!search.value) return all
    const q = search.value.toLowerCase()
    return all.filter((s) => s.title.toLowerCase().includes(q))
  })

  const totalItems = computed(() => filtered.value.length)

  const songs = computed(() => {
    const start = (page.value - 1) * perPage
    return filtered.value.slice(start, start + perPage)
  })

  // Reset page when search changes
  watch(search, () => {
    page.value = 1
  })

  // Fetch on first use
  callOnce('library-songs', () => library.fetchSongs())

  function refresh() {
    return library.fetchSongs(true)
  }

  return { songs, totalItems, page, perPage, search, status, error, refresh }
}
