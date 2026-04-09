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
  const { loadedVideoId } = useYouTubePlayer()
  const player = usePlayerStore()
  const queue = useQueueStore()
  const { recordPlay } = usePlayHistory()

  let prevSong: Song | null = null
  let accSeconds = 0

  // Increment accumulated seconds every second while the player is active
  setInterval(() => {
    if (player.isPlaying) accSeconds++
  }, 1000)

  // When the video changes, flush the previous song's accumulated time and
  // start tracking the new song. This fires for both manual plays and
  // auto-advance to the next song.
  watch(loadedVideoId, () => {
    if (prevSong && accSeconds >= calcThreshold(prevSong)) {
      recordPlay(prevSong)
    }
    prevSong = queue.currentSong ?? null
    accSeconds = 0
  })
})
