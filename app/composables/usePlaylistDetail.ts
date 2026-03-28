import type { Song, SongsResponse } from '~/types'

export function usePlaylistDetail(playlistId: string) {
  const playlistsStore = usePlaylistsStore()
  const { $api } = useApi()

  const songs = ref<Song[]>([])
  const status = ref<'idle' | 'pending' | 'ready' | 'error'>('idle')

  const playlist = computed(() => playlistsStore.getById(playlistId))

  async function fetchSongs() {
    const pl = playlist.value
    if (!pl || pl.items.length === 0) {
      songs.value = []
      status.value = 'ready'
      return
    }

    status.value = 'pending'
    try {
      const songIds = pl.items.map((item) => item.song_id)
      const params = new URLSearchParams()
      songIds.forEach((id) => params.append('filter{id.in}', String(id)))
      params.set('per_page', String(songIds.length))

      const res = await $api<SongsResponse>(`/api/songs/?${params.toString()}`)
      const fetchedSongs = res.songs

      // Sort by playlist item order
      songs.value = pl.items
        .map((item) => fetchedSongs.find((s) => s.id === item.song_id))
        .filter((s): s is Song => s !== undefined)

      status.value = 'ready'
    } catch {
      status.value = 'error'
    }
  }

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
    fetchSongs,
  }
}
