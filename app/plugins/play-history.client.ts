import type { Song } from '~/types'

// Flat threshold seconds (used when song duration is unknown or very long)
const FLAT_THRESHOLD_SEC = 20

/**
 * Returns the minimum seconds a song must be played for it to count as a
 * qualified play. For short clips, 30% of the clip duration is used instead
 * of the flat threshold to avoid inflating counts on short songs.
 */
function calcThreshold(song: Song): number {
  if (song.end_at > 0) {
    const duration = song.end_at - song.start_at
    return Math.max(FLAT_THRESHOLD_SEC, duration * 0.3)
  }
  return FLAT_THRESHOLD_SEC
}

export default defineNuxtPlugin(() => {
  const player = usePlayerStore()
  const { recordPlay } = usePlayHistory()

  let prevSong: Song | null = null
  let accSeconds = 0

  // Increment accumulated seconds every second while the player is active
  setInterval(() => {
    if (player.isPlaying) accSeconds++
  }, 1000)

  // Watch currentSong ID instead of loadedVideoId so that consecutive songs
  // from the same video (same videoId, different start_at) are each tracked.
  watch(
    () => player.currentSong?.id,
    () => {
      if (prevSong && accSeconds >= calcThreshold(prevSong)) {
        recordPlay(prevSong)
      }
      prevSong = player.currentSong ?? null
      accSeconds = 0
    },
  )
})
