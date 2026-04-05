import type { Song } from '~/types'

export type RepeatMode = 'off' | 'all' | 'one'

export const useQueueStore = defineStore('queue', () => {
  const songs = ref<Song[]>([])
  const currentIndex = ref(-1)
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
    if (currentIndex.value < songs.value.length - 1) {
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

  function shuffleQueue() {
    if (songs.value.length <= 1) return
    const current = songs.value[currentIndex.value]
    const rest = songs.value.filter((_, i) => i !== currentIndex.value)
    // Fisher-Yates shuffle
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[rest[i], rest[j]] = [rest[j], rest[i]]
    }
    songs.value = [current, ...rest]
    currentIndex.value = 0
  }

  function cycleRepeatMode() {
    const modes: RepeatMode[] = ['off', 'all', 'one']
    const idx = modes.indexOf(repeatMode.value)
    repeatMode.value = modes[(idx + 1) % modes.length]
  }

  function moveSong(from: number, to: number) {
    if (from === to) return
    songs.value.splice(to, 0, songs.value.splice(from, 1)[0])
    if (currentIndex.value === from) {
      currentIndex.value = to
    } else if (from < to && currentIndex.value > from && currentIndex.value <= to) {
      currentIndex.value--
    } else if (from > to && currentIndex.value >= to && currentIndex.value < from) {
      currentIndex.value++
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

  function toggleOpen() {
    isOpen.value = !isOpen.value
  }

  return {
    songs,
    currentIndex,
    repeatMode,
    isOpen,
    currentSong,
    hasNext,
    hasPrevious,
    totalDuration,
    setSongs,
    addSong,
    addSongNext,
    removeSong,
    moveSong,
    clear,
    next,
    previous,
    shuffleQueue,
    cycleRepeatMode,
    toggleOpen,
  }
})
