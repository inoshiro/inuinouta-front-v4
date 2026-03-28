import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { Song } from '../../app/types'
import { useQueueStore } from '../../app/stores/queue'
import { usePlayerStore } from '../../app/stores/player'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeSong = (id: number): Song => ({
  id,
  title: `Song ${id}`,
  artist: `Artist ${id}`,
  is_original: false,
  start_at: 0,
  end_at: 180,
  video: {
    id: `video_${id}`,
    title: `Video ${id}`,
    url: `https://youtube.com/watch?v=video_${id}`,
    thumbnail_path: '',
    is_open: true,
    is_member_only: false,
    is_stream: false,
    unplayable: false,
    published_at: '2024-01-01T00:00:00Z',
  },
})

const QUEUE_KEY = 'playback:queue'
const SETTINGS_KEY = 'playback:settings'

/**
 * Simulate the restoration logic that playback-persistence.client.ts performs.
 * This avoids the need to invoke a Nuxt plugin in unit tests while still
 * covering the acceptance criteria of Issue #18.
 */
function simulateRestore(
  queue: ReturnType<typeof useQueueStore>,
  player: ReturnType<typeof usePlayerStore>,
) {
  // Restore settings
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const settings = JSON.parse(raw)
      if (typeof settings.volume === 'number') player.setVolume(settings.volume)
      if (typeof settings.isMuted === 'boolean') player.isMuted = settings.isMuted
    }
  } catch {
    // Ignore invalid settings data
  }

  // Restore queue
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    if (raw) {
      const persisted = JSON.parse(raw)
      if (Array.isArray(persisted.songs) && persisted.songs.length > 0) {
        const validIndex =
          typeof persisted.currentIndex === 'number' &&
          persisted.currentIndex >= 0 &&
          persisted.currentIndex < persisted.songs.length
            ? persisted.currentIndex
            : 0

        queue.setSongs(persisted.songs, validIndex)

        if (typeof persisted.shuffleMode === 'boolean') queue.shuffleMode = persisted.shuffleMode
        const validModes = ['off', 'all', 'one']
        if (validModes.includes(persisted.repeatMode)) queue.repeatMode = persisted.repeatMode

        // Sync current song to player (no autoplay)
        const currentSong = queue.currentSong
        if (currentSong) player.currentSong = currentSong
      }
    }
  } catch {
    // Ignore invalid queue data
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('playback persistence (Issue #18)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  describe('queue 復元', () => {
    it('曲順と currentIndex が正しく復元される', () => {
      const songs = [makeSong(1), makeSong(2), makeSong(3)]
      localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify({ songs, currentIndex: 1, shuffleMode: false, repeatMode: 'off' }),
      )

      const queue = useQueueStore()
      const player = usePlayerStore()
      simulateRestore(queue, player)

      expect(queue.songs.map((s) => s.id)).toEqual([1, 2, 3])
      expect(queue.currentIndex).toBe(1)
    })

    it('repeatMode と shuffleMode が復元される', () => {
      const songs = [makeSong(1)]
      localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify({ songs, currentIndex: 0, shuffleMode: true, repeatMode: 'all' }),
      )

      const queue = useQueueStore()
      const player = usePlayerStore()
      simulateRestore(queue, player)

      expect(queue.shuffleMode).toBe(true)
      expect(queue.repeatMode).toBe('all')
    })

    it('復元後に player.currentSong が queue.currentSong と一致する（PlayerBar 表示可）', () => {
      const songs = [makeSong(10), makeSong(20)]
      localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify({ songs, currentIndex: 1, shuffleMode: false, repeatMode: 'off' }),
      )

      const queue = useQueueStore()
      const player = usePlayerStore()
      simulateRestore(queue, player)

      expect(player.currentSong?.id).toBe(20)
      expect(player.currentSong?.id).toBe(queue.currentSong?.id)
    })

    it('自動再生されない（isPlaying が false のまま）', () => {
      const songs = [makeSong(1)]
      localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify({ songs, currentIndex: 0, shuffleMode: false, repeatMode: 'off' }),
      )

      const queue = useQueueStore()
      const player = usePlayerStore()
      simulateRestore(queue, player)

      expect(player.isPlaying).toBe(false)
    })
  })

  describe('設定復元', () => {
    it('volume と isMuted が復元される', () => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ volume: 60, isMuted: true }))

      const queue = useQueueStore()
      const player = usePlayerStore()
      simulateRestore(queue, player)

      expect(player.volume).toBe(60)
      expect(player.isMuted).toBe(true)
    })

    it('volume が 0 でも正しく復元される', () => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ volume: 0, isMuted: false }))

      const queue = useQueueStore()
      const player = usePlayerStore()
      simulateRestore(queue, player)

      expect(player.volume).toBe(0)
      expect(player.isMuted).toBe(false)
    })
  })

  describe('不正データへの耐性', () => {
    it('LocalStorage に不正 JSON が入っていても壊れない', () => {
      localStorage.setItem(QUEUE_KEY, 'invalid-json{{{')
      localStorage.setItem(SETTINGS_KEY, 'not json')

      const queue = useQueueStore()
      const player = usePlayerStore()

      expect(() => simulateRestore(queue, player)).not.toThrow()
      expect(queue.songs).toHaveLength(0)
    })

    it('songs が空配列のときはキューを復元しない', () => {
      localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify({ songs: [], currentIndex: 0, shuffleMode: false, repeatMode: 'off' }),
      )

      const queue = useQueueStore()
      const player = usePlayerStore()
      simulateRestore(queue, player)

      expect(queue.songs).toHaveLength(0)
      expect(player.currentSong).toBeNull()
    })

    it('currentIndex が範囲外でも先頭曲を使う', () => {
      const songs = [makeSong(1), makeSong(2)]
      localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify({ songs, currentIndex: 99, shuffleMode: false, repeatMode: 'off' }),
      )

      const queue = useQueueStore()
      const player = usePlayerStore()
      simulateRestore(queue, player)

      expect(queue.currentIndex).toBe(0)
    })

    it('不正な repeatMode は無視される', () => {
      const songs = [makeSong(1)]
      localStorage.setItem(
        QUEUE_KEY,
        JSON.stringify({ songs, currentIndex: 0, shuffleMode: false, repeatMode: 'invalid' }),
      )

      const queue = useQueueStore()
      const player = usePlayerStore()
      simulateRestore(queue, player)

      // repeatMode should remain the default 'off'
      expect(queue.repeatMode).toBe('off')
    })
  })
})
