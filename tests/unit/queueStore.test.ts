import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import type { Song } from '../../app/types'
import { useQueueStore } from '../../app/stores/queue'

const makeSong = (id: number, durationSec = 180): Song => ({
  id,
  title: `Song ${id}`,
  artist: `Artist ${id}`,
  is_original: false,
  start_at: 0,
  end_at: durationSec,
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

const ids = (arr: Song[]) => arr.map((s) => s.id)

describe('useQueueStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // --- moveSong ---

  describe('moveSong', () => {
    it('後ろへ移動: インデックスが正しく入れ替わる', () => {
      const queue = useQueueStore()
      queue.setSongs([makeSong(1), makeSong(2), makeSong(3), makeSong(4)], 0)
      queue.moveSong(0, 2)
      expect(ids(queue.songs)).toEqual([2, 3, 1, 4])
    })

    it('前へ移動: インデックスが正しく入れ替わる', () => {
      const queue = useQueueStore()
      queue.setSongs([makeSong(1), makeSong(2), makeSong(3), makeSong(4)], 0)
      queue.moveSong(3, 1)
      expect(ids(queue.songs)).toEqual([1, 4, 2, 3])
    })

    it('同じ位置への移動は何もしない', () => {
      const queue = useQueueStore()
      queue.setSongs([makeSong(1), makeSong(2), makeSong(3)], 1)
      queue.moveSong(1, 1)
      expect(ids(queue.songs)).toEqual([1, 2, 3])
      expect(queue.currentIndex).toBe(1)
    })

    it('現在曲を移動しても currentIndex が追従する', () => {
      const queue = useQueueStore()
      queue.setSongs([makeSong(1), makeSong(2), makeSong(3)], 0)
      // 曲1(index=0)を index=2 へ移動
      queue.moveSong(0, 2)
      expect(queue.currentIndex).toBe(2)
      expect(queue.currentSong?.id).toBe(1)
    })

    it('現在曲より前の曲を後ろへ移動すると currentIndex が 1 減る', () => {
      const queue = useQueueStore()
      queue.setSongs([makeSong(1), makeSong(2), makeSong(3)], 2)
      // 曲1(index=0)を index=2 へ移動 → currentIndex が 2→1
      queue.moveSong(0, 2)
      expect(queue.currentIndex).toBe(1)
      expect(queue.currentSong?.id).toBe(3)
    })

    it('現在曲より後ろの曲を前へ移動すると currentIndex が 1 増える', () => {
      const queue = useQueueStore()
      queue.setSongs([makeSong(1), makeSong(2), makeSong(3)], 0)
      // 曲3(index=2)を index=0 へ移動 → currentIndex が 0→1
      queue.moveSong(2, 0)
      expect(queue.currentIndex).toBe(1)
      expect(queue.currentSong?.id).toBe(1)
    })

    it('影響範囲外の移動では currentIndex が変わらない', () => {
      const queue = useQueueStore()
      queue.setSongs([makeSong(1), makeSong(2), makeSong(3), makeSong(4)], 0)
      // index=1 を index=3 へ移動 → currentIndex=0 は影響なし
      queue.moveSong(1, 3)
      expect(queue.currentIndex).toBe(0)
      expect(queue.currentSong?.id).toBe(1)
    })
  })

  // --- totalDuration ---

  describe('totalDuration', () => {
    it('空キューは "0分" を返す', () => {
      const queue = useQueueStore()
      expect(queue.totalDuration).toBe('0分')
    })

    it('合計秒数が分単位で表示される', () => {
      const queue = useQueueStore()
      queue.setSongs([makeSong(1, 180), makeSong(2, 120)], 0)
      // 300秒 = 5分
      expect(queue.totalDuration).toBe('5分')
    })

    it('1時間以上は時間と分で表示される', () => {
      const queue = useQueueStore()
      queue.setSongs([makeSong(1, 3660)], 0)
      // 3660秒 = 1時間1分
      expect(queue.totalDuration).toBe('1時間1分')
    })
  })
})
