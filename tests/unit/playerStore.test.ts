import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { Song } from '../../app/types'
import { usePlayerStore } from '../../app/stores/player'
import { useQueueStore } from '../../app/stores/queue'

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

describe('usePlayerStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('stop()', () => {
    it('isPlaying, currentSong, currentTime, isBlocked をすべてリセットする', () => {
      const player = usePlayerStore()
      player.play(makeSong(1))
      player.updateTime(60)
      player.stop()
      expect(player.isPlaying).toBe(false)
      expect(player.currentSong).toBeNull()
      expect(player.currentTime).toBe(0)
      expect(player.isBlocked).toBe(false)
    })
  })

  describe('stopPlayback()', () => {
    it('isPlaying と currentTime をリセットするが currentSong は残す', () => {
      const player = usePlayerStore()
      const song = makeSong(1)
      player.play(song)
      player.updateTime(90)
      player.stopPlayback()
      expect(player.isPlaying).toBe(false)
      expect(player.currentTime).toBe(0)
      expect(player.currentSong).not.toBeNull()
      expect(player.currentSong?.id).toBe(1)
      expect(player.isBlocked).toBe(false)
    })

    it('isAtEnd を true にセットする', () => {
      const player = usePlayerStore()
      player.play(makeSong(1))
      expect(player.isAtEnd).toBe(false)
      player.stopPlayback()
      expect(player.isAtEnd).toBe(true)
    })

    it('isBlocked が true でも stopPlayback() でクリアされる', () => {
      const player = usePlayerStore()
      player.play(makeSong(2))
      player.setBlocked()
      player.stopPlayback()
      expect(player.isBlocked).toBe(false)
      expect(player.currentSong).not.toBeNull()
    })

    it('play() を呼ぶと isAtEnd がクリアされる', () => {
      const player = usePlayerStore()
      player.play(makeSong(1))
      player.stopPlayback()
      expect(player.isAtEnd).toBe(true)
      player.play(makeSong(1))
      expect(player.isAtEnd).toBe(false)
    })
  })
})

// ---------------------------------------------------------------------------
// End-of-queue sync (Issue #51)
// ---------------------------------------------------------------------------
// usePlayback uses useYouTubePlayer which requires a real browser environment,
// so we test the store-level invariant directly: queue.next() returning null
// at end of queue must leave queue.currentSong intact.

describe('queue.next() at end of queue (repeat off)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('末尾曲終了後も queue.songs と queue.currentSong が残る', () => {
    const queue = useQueueStore()
    queue.setSongs([makeSong(1), makeSong(2)], 1)
    queue.repeatMode = 'off'
    const result = queue.next()
    expect(result).toBeNull()
    expect(queue.songs.length).toBe(2)
    expect(queue.currentSong?.id).toBe(2)
    expect(queue.currentIndex).toBe(1)
  })

  it('1曲キュー repeat off で next() が null を返し queue は維持される', () => {
    const queue = useQueueStore()
    queue.setSongs([makeSong(1)], 0)
    queue.repeatMode = 'off'
    const result = queue.next()
    expect(result).toBeNull()
    expect(queue.songs.length).toBe(1)
    expect(queue.currentSong?.id).toBe(1)
  })

  it('repeat all の場合は末尾から先頭へループして null を返さない', () => {
    const queue = useQueueStore()
    queue.setSongs([makeSong(1), makeSong(2)], 1)
    queue.repeatMode = 'all'
    const result = queue.next()
    expect(result).not.toBeNull()
    expect(queue.currentIndex).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Player + Queue sync for clear / remove (Issue #51)
// ---------------------------------------------------------------------------

describe('player と queue の同期ルール (Issue #51)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('queue.clear() 後に player.stop() を呼ぶと currentSong が null になる', () => {
    const player = usePlayerStore()
    const queue = useQueueStore()
    queue.setSongs([makeSong(1), makeSong(2)], 0)
    player.play(makeSong(1))
    // clearQueue() が行う操作をシミュレート
    queue.clear()
    player.stop()
    expect(queue.songs.length).toBe(0)
    expect(player.currentSong).toBeNull()
  })

  it('removeSong でキューが空になったとき player.stop() を呼ぶと currentSong が null になる', () => {
    const player = usePlayerStore()
    const queue = useQueueStore()
    queue.setSongs([makeSong(1)], 0)
    player.play(makeSong(1))
    // removeSongFromQueue() が行う操作をシミュレート
    queue.removeSong(0)
    if (queue.songs.length === 0) player.stop()
    expect(queue.songs.length).toBe(0)
    expect(player.currentSong).toBeNull()
  })

  it('removeSong で現在曲が削除されたとき player.currentSong が新 currentSong に追従する', () => {
    const player = usePlayerStore()
    const queue = useQueueStore()
    queue.setSongs([makeSong(1), makeSong(2), makeSong(3)], 0)
    player.play(makeSong(1))
    // removeSongFromQueue(0) が行う操作をシミュレート
    queue.removeSong(0)
    if (queue.songs.length === 0) {
      player.stop()
    } else {
      const current = queue.currentSong
      if (current && player.currentSong?.id !== current.id) {
        player.currentSong = current
      }
    }
    expect(queue.songs.length).toBe(2)
    expect(queue.currentSong?.id).toBe(2)
    expect(player.currentSong?.id).toBe(2)
  })

  it('stopPlayback() 後は PlayerBar が維持される (currentSong が残る)', () => {
    const player = usePlayerStore()
    player.play(makeSong(1))
    // 末尾到達時の nextSong() の動作をシミュレート
    player.stopPlayback()
    // PlayerBar の v-if="player.currentSong" が true のままであること
    expect(player.currentSong).not.toBeNull()
    expect(player.isPlaying).toBe(false)
  })
})
