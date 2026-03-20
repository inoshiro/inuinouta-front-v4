import type { Song } from '~/types'

export type RepeatMode = 'off' | 'all' | 'one'

export const useQueueStore = defineStore('queue', () => {
  const songs = ref<Song[]>([])
  const currentIndex = ref(-1)
  const shuffleMode = ref(false)
  const repeatMode = ref<RepeatMode>('off')
  const isOpen = ref(false)

  const currentSong = computed(() =>
    currentIndex.value >= 0 && currentIndex.value < songs.value.length
      ? songs.value[currentIndex.value]
      : null,
  )

  const hasNext = computed(() => {
    if (repeatMode.value !== 'off') return songs.value.length > 0
    return currentIndex.value < songs.value.length - 1
  })

  const hasPrevious = computed(() => {
    if (repeatMode.value === 'all') return songs.value.length > 0
    return currentIndex.value > 0
  })

  function setSongs(newSongs: Song[], startIndex = 0) {
    songs.value = newSongs
    currentIndex.value = startIndex
  }

  function addSong(song: Song) {
    songs.value.push(song)
    if (songs.value.length === 1) {
      currentIndex.value = 0
    }
  }

  function addSongNext(song: Song) {
    const insertAt = currentIndex.value + 1
    songs.value.splice(insertAt, 0, song)
  }

  function removeSong(index: number) {
    songs.value.splice(index, 1)
    if (index < currentIndex.value) {
      currentIndex.value--
    } else if (index === currentIndex.value) {
      if (currentIndex.value >= songs.value.length) {
        currentIndex.value = Math.max(songs.value.length - 1, -1)
      }
    }
    if (songs.value.length === 0) {
      currentIndex.value = -1
    }
  }

  function clear() {
    songs.value = []
    currentIndex.value = -1
  }

  function next(): Song | null {
    if (songs.value.length === 0) return null
    if (repeatMode.value === 'one') return currentSong.value
    if (shuffleMode.value) {
      currentIndex.value = Math.floor(Math.random() * songs.value.length)
    } else if (currentIndex.value < songs.value.length - 1) {
      currentIndex.value++
    } else if (repeatMode.value === 'all') {
      currentIndex.value = 0
    } else {
      return null
    }
    return currentSong.value
  }

  function previous(): Song | null {
    if (songs.value.length === 0) return null
    if (currentIndex.value > 0) {
      currentIndex.value--
    } else if (repeatMode.value === 'all') {
      currentIndex.value = songs.value.length - 1
    }
    return currentSong.value
  }

  function toggleShuffle() {
    shuffleMode.value = !shuffleMode.value
  }

  function cycleRepeatMode() {
    const modes: RepeatMode[] = ['off', 'all', 'one']
    const idx = modes.indexOf(repeatMode.value)
    repeatMode.value = modes[(idx + 1) % modes.length]
  }

  function toggleOpen() {
    isOpen.value = !isOpen.value
  }

  return {
    songs,
    currentIndex,
    shuffleMode,
    repeatMode,
    isOpen,
    currentSong,
    hasNext,
    hasPrevious,
    setSongs,
    addSong,
    addSongNext,
    removeSong,
    clear,
    next,
    previous,
    toggleShuffle,
    cycleRepeatMode,
    toggleOpen,
  }
})
