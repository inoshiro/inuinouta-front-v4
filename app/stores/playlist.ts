import type { Track } from './player'

export type RepeatMode = 'off' | 'all' | 'one'

export const usePlaylistStore = defineStore('playlist', () => {
  const tracks = ref<Track[]>([])
  const currentIndex = ref(-1)
  const shuffleMode = ref(false)
  const repeatMode = ref<RepeatMode>('off')

  const currentTrack = computed(() =>
    currentIndex.value >= 0 && currentIndex.value < tracks.value.length
      ? tracks.value[currentIndex.value]
      : null,
  )

  const hasNext = computed(() => {
    if (repeatMode.value === 'all' || repeatMode.value === 'one') return tracks.value.length > 0
    return currentIndex.value < tracks.value.length - 1
  })

  const hasPrevious = computed(() => {
    if (repeatMode.value === 'all') return tracks.value.length > 0
    return currentIndex.value > 0
  })

  function setTracks(newTracks: Track[], startIndex = 0) {
    tracks.value = newTracks
    currentIndex.value = startIndex
  }

  function next(): Track | null {
    if (tracks.value.length === 0) return null
    if (repeatMode.value === 'one') return currentTrack.value
    if (shuffleMode.value) {
      currentIndex.value = Math.floor(Math.random() * tracks.value.length)
    } else if (currentIndex.value < tracks.value.length - 1) {
      currentIndex.value++
    } else if (repeatMode.value === 'all') {
      currentIndex.value = 0
    } else {
      return null
    }
    return currentTrack.value
  }

  function previous(): Track | null {
    if (tracks.value.length === 0) return null
    if (currentIndex.value > 0) {
      currentIndex.value--
    } else if (repeatMode.value === 'all') {
      currentIndex.value = tracks.value.length - 1
    }
    return currentTrack.value
  }

  function toggleShuffle() {
    shuffleMode.value = !shuffleMode.value
  }

  function cycleRepeatMode() {
    const modes: RepeatMode[] = ['off', 'all', 'one']
    const currentModeIndex = modes.indexOf(repeatMode.value)
    repeatMode.value = modes[(currentModeIndex + 1) % modes.length]
  }

  return {
    tracks,
    currentIndex,
    shuffleMode,
    repeatMode,
    currentTrack,
    hasNext,
    hasPrevious,
    setTracks,
    next,
    previous,
    toggleShuffle,
    cycleRepeatMode,
  }
})
