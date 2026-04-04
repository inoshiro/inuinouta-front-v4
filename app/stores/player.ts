import type { Song } from '~/types'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref<Song | null>(null)
  const isPlaying = ref(false)
  /** True when the browser blocked autoplay / scripted playback */
  const isBlocked = ref(false)
  /** True when playback stopped at the natural end of a song (ENDED state). */
  const isAtEnd = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(100)
  const isMuted = ref(false)

  /** Set current song and optimistically mark as playing (UI feedback). */
  function play(song: Song) {
    currentSong.value = song
    isPlaying.value = true
    isBlocked.value = false
    isAtEnd.value = false
  }

  function pause() {
    isPlaying.value = false
  }

  function resume() {
    isPlaying.value = true
  }

  function stop() {
    isPlaying.value = false
    currentTime.value = 0
    currentSong.value = null
    isBlocked.value = false
    isAtEnd.value = false
  }

  /**
   * Stop playback without clearing the current song.
   * Used when the queue reaches its end (repeat off) so that PlayerBar
   * remains visible and the user can restart or navigate.
   * Sets isAtEnd so the play button knows to reload from start_at.
   */
  function stopPlayback() {
    isPlaying.value = false
    currentTime.value = 0
    isBlocked.value = false
    isAtEnd.value = true
  }

  /** Sync isPlaying with the actual YouTube player state. */
  function setPlaying(value: boolean) {
    isPlaying.value = value
    if (value) isBlocked.value = false
  }

  /** Mark playback as blocked by the browser autoplay policy. */
  function setBlocked() {
    isBlocked.value = true
    isPlaying.value = false
  }

  function clearBlocked() {
    isBlocked.value = false
  }

  function setVolume(value: number) {
    volume.value = Math.max(0, Math.min(100, value))
  }

  function toggleMute() {
    isMuted.value = !isMuted.value
  }

  function updateTime(time: number) {
    currentTime.value = time
  }

  function setDuration(value: number) {
    duration.value = value
  }

  return {
    currentSong,
    isPlaying,
    isBlocked,
    isAtEnd,
    currentTime,
    duration,
    volume,
    isMuted,
    play,
    pause,
    resume,
    stop,
    stopPlayback,
    setPlaying,
    setBlocked,
    clearBlocked,
    setVolume,
    toggleMute,
    updateTime,
    setDuration,
  }
})
