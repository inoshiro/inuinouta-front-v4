import type { Song } from '~/types'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref<Song | null>(null)
  const isPlaying = ref(false)
  /** True when the browser blocked autoplay / scripted playback */
  const isBlocked = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(100)
  const isMuted = ref(false)

  /** Set current song and optimistically mark as playing (UI feedback). */
  function play(song: Song) {
    currentSong.value = song
    isPlaying.value = true
    isBlocked.value = false
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
    currentTime,
    duration,
    volume,
    isMuted,
    play,
    pause,
    resume,
    stop,
    setPlaying,
    setBlocked,
    clearBlocked,
    setVolume,
    toggleMute,
    updateTime,
    setDuration,
  }
})
