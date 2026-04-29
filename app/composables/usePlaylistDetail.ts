import type { Song } from '~/types'

export function usePlaylistDetail(playlistId: string) {
  const playlistsStore = usePlaylistsStore()
  const library = useLibraryStore()

  const playlist = computed(() => playlistsStore.getById(playlistId))

  // Ensure library songs are available (no-op when already loaded or loading).
  void callOnce('library-songs', () => library.fetchSongs())

  const status = computed<'idle' | 'pending' | 'ready' | 'error'>(() => {
    if (!playlistsStore.loaded) return 'pending'
    const pl = playlist.value
    // Empty playlist does not need library songs
    if (!pl || pl.items.length === 0) return 'ready'
    if (library.songsStatus === 'idle' || library.songsStatus === 'pending') return 'pending'
    if (library.songsStatus === 'error') return 'error'
    return 'ready'
  })

  const songs = computed<Song[]>(() => {
    const pl = playlist.value
    if (!pl || library.songsStatus !== 'ready') return []
    const map = new Map<number, Song>(library.allSongs.map((s) => [s.id, s]))
    return pl.items.map((item) => map.get(item.song_id)).filter((s): s is Song => s !== undefined)
  })

  const totalDuration = computed(() => {
    const totalSeconds = songs.value.reduce((sum, song) => {
      return sum + Math.max(0, song.end_at - song.start_at)
    }, 0)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    if (hours > 0) return `${hours}時間${minutes}分`
    return `${minutes}分`
  })

  return {
    playlist,
    songs: readonly(songs),
    status: readonly(status),
    totalDuration,
  }
}
