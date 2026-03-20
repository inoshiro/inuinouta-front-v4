import type { Song } from '~/types'

export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref<Song | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(100)
  const isMuted = ref(false)

  function play(song: Song) {
    currentSong.value = song
    isPlaying.value = true
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
    currentTime,
    duration,
    volume,
    isMuted,
    play,
    pause,
    resume,
    stop,
    setVolume,
    toggleMute,
    updateTime,
    setDuration,
  }
})
