import type { Song } from '~/types'

/**
 * Extracts up to `limit` related songs by the same artist from the library.
 *
 * Rules:
 * - Same artist (case-sensitive match)
 * - Excludes the current song (by id)
 * - Excludes songs from the same video (by video.id)
 * - Shuffled once when currentSong changes, then stable until next change
 * - Returns empty array when artist is null or library is not yet loaded
 */
export function useRelatedSongs(currentSong: Ref<Song | null>, limit = 5) {
  const library = useLibraryStore()

  const relatedSongs = computed(() => {
    const song = currentSong.value
    if (!song || !song.artist) return []

    const candidates = library.allSongs.filter(
      (s) => s.artist === song.artist && s.id !== song.id && s.video.id !== song.video.id,
    )

    // Fisher-Yates shuffle (on a copy so we don't mutate the library)
    const shuffled = [...candidates]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = shuffled[i]!
      shuffled[i] = shuffled[j]!
      shuffled[j] = tmp
    }

    return shuffled.slice(0, limit)
  })

  // Cache the result per song id so it stays stable until the song changes.
  // computed re-evaluates whenever dependencies change, but we only want to
  // re-shuffle when the song id changes.
  const cachedSongId = ref<number | null>(null)
  const cachedSongs = ref<Song[]>([])

  watch(
    () => currentSong.value?.id,
    () => {
      const songId = currentSong.value?.id ?? null
      if (songId !== cachedSongId.value) {
        cachedSongId.value = songId
        cachedSongs.value = relatedSongs.value
      }
    },
    { immediate: true },
  )

  return { relatedSongs: readonly(cachedSongs) }
}
