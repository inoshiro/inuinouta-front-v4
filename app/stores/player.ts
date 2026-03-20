export interface Track {
  id: string
  title: string
  artist: string
  videoId: string
  startSeconds?: number
  endSeconds?: number
  thumbnailUrl?: string
}

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref<Track | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(100)
  const isMuted = ref(false)

  function play(track: Track) {
    currentTrack.value = track
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
    currentTrack,
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
