import type { Song } from '~/types'
import type { RepeatMode } from '~/stores/queue'

const QUEUE_STORAGE_KEY = 'playback:queue'
const SETTINGS_STORAGE_KEY = 'playback:settings'

interface PersistedQueue {
  songs: Song[]
  currentIndex: number
  repeatMode: RepeatMode
}

interface PersistedSettings {
  volume: number
  isMuted: boolean
}

function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function saveJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore storage errors (e.g., quota exceeded, private mode restrictions)
  }
}

export default defineNuxtPlugin(() => {
  const queue = useQueueStore()
  const player = usePlayerStore()

  // Restore playback settings (volume, mute) — safe to apply without user gesture
  const settings = loadJson<PersistedSettings>(SETTINGS_STORAGE_KEY)
  if (settings) {
    if (typeof settings.volume === 'number') {
      player.setVolume(settings.volume)
    }
    if (typeof settings.isMuted === 'boolean') {
      player.isMuted = settings.isMuted
    }
  }

  // Restore queue state (songs, currentIndex, repeat)
  const persistedQueue = loadJson<PersistedQueue>(QUEUE_STORAGE_KEY)
  if (persistedQueue && Array.isArray(persistedQueue.songs) && persistedQueue.songs.length > 0) {
    const validIndex =
      typeof persistedQueue.currentIndex === 'number' &&
      persistedQueue.currentIndex >= 0 &&
      persistedQueue.currentIndex < persistedQueue.songs.length
        ? persistedQueue.currentIndex
        : 0

    queue.setSongs(persistedQueue.songs, validIndex)

    const validRepeatModes: RepeatMode[] = ['off', 'all', 'one']
    if (validRepeatModes.includes(persistedQueue.repeatMode)) {
      queue.repeatMode = persistedQueue.repeatMode
    }

    // Sync current song to player so PlayerBar shows the restored song.
    // No autoplay — user must initiate playback explicitly.
    const currentSong = queue.currentSong
    if (currentSong) {
      player.currentSong = currentSong
    }
  }

  // Persist queue state on every change
  watch(
    () => ({
      songs: queue.songs,
      currentIndex: queue.currentIndex,
      repeatMode: queue.repeatMode,
    }),
    (state) => {
      saveJson(QUEUE_STORAGE_KEY, state)
    },
    { deep: true },
  )

  // Persist playback settings on every change
  watch(
    () => ({
      volume: player.volume,
      isMuted: player.isMuted,
    }),
    (state) => {
      saveJson(SETTINGS_STORAGE_KEY, state)
    },
  )
})
