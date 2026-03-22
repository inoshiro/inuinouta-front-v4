import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { Song, VideoList, SongsResponse, VideosResponse } from '~/types'

// --- テスト用データ生成ヘルパー ---

const makeSong = (id: number, title: string): Song => ({
  id,
  title,
  artist: null,
  is_original: false,
  start_at: 0,
  end_at: 300,
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

const makeVideo = (id: string, title: string): VideoList => ({
  id,
  title,
  url: `https://youtube.com/watch?v=${id}`,
  thumbnail_path: '',
  is_open: true,
  is_member_only: false,
  is_stream: false,
  unplayable: false,
  published_at: '2024-01-01T00:00:00Z',
  songs_count: 5,
})

// --- useApi モック ---

const mockApiFn = vi.fn()

mockNuxtImport('useApi', () => {
  return () => ({ $api: mockApiFn, useApiFetch: vi.fn() })
})

// --- テスト ---

describe('useLibraryStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockApiFn.mockReset()
  })

  // ------------------------------------------------------------------ Songs --

  describe('fetchSongs', () => {
    it('API から取得した songs を allSongs に格納し、status が ready になる', async () => {
      mockApiFn.mockResolvedValueOnce({
        songs: [makeSong(1, '曲1')],
        meta: { page: 1, per_page: 200, total_results: 1, total_pages: 1 },
      } satisfies SongsResponse)

      const store = useLibraryStore()
      await store.fetchSongs()

      expect(store.allSongs).toHaveLength(1)
      expect(store.allSongs[0].title).toBe('曲1')
      expect(store.songsStatus).toBe('ready')
      expect(store.songsError).toBeNull()
    })

    it('複数ページがある場合は全ページ分取得して allSongs に結合する', async () => {
      // Page 1
      mockApiFn.mockResolvedValueOnce({
        songs: [makeSong(1, '曲1')],
        meta: { page: 1, per_page: 1, total_results: 2, total_pages: 2 },
      } satisfies SongsResponse)
      // Page 2
      mockApiFn.mockResolvedValueOnce({
        songs: [makeSong(2, '曲2')],
        meta: { page: 2, per_page: 1, total_results: 2, total_pages: 2 },
      } satisfies SongsResponse)

      const store = useLibraryStore()
      await store.fetchSongs()

      expect(store.allSongs).toHaveLength(2)
      expect(mockApiFn).toHaveBeenCalledTimes(2)
    })

    it('status が ready の場合は再取得しない（force=false）', async () => {
      mockApiFn.mockResolvedValueOnce({
        songs: [makeSong(1, '曲1')],
        meta: { page: 1, per_page: 200, total_results: 1, total_pages: 1 },
      } satisfies SongsResponse)

      const store = useLibraryStore()
      await store.fetchSongs()
      await store.fetchSongs() // 2 回目

      expect(mockApiFn).toHaveBeenCalledTimes(1)
    })

    it('force=true の場合は取得済みでも再取得する', async () => {
      mockApiFn.mockResolvedValue({
        songs: [],
        meta: { page: 1, per_page: 200, total_results: 0, total_pages: 1 },
      } satisfies SongsResponse)

      const store = useLibraryStore()
      await store.fetchSongs()
      await store.fetchSongs(true)

      expect(mockApiFn).toHaveBeenCalledTimes(2)
    })

    it('API がエラーを投げたとき songsStatus が error になり songsError に格納される', async () => {
      mockApiFn.mockRejectedValueOnce(new Error('Network error'))

      const store = useLibraryStore()
      await store.fetchSongs()

      expect(store.songsStatus).toBe('error')
      expect(store.songsError?.message).toBe('Network error')
    })
  })

  // ----------------------------------------------------------------- Videos --

  describe('fetchVideos', () => {
    it('API から取得した videos を allVideos に格納し、status が ready になる', async () => {
      mockApiFn.mockResolvedValueOnce({
        videos: [makeVideo('abc', '動画1')],
        meta: { page: 1, per_page: 200, total_results: 1, total_pages: 1 },
      } satisfies VideosResponse)

      const store = useLibraryStore()
      await store.fetchVideos()

      expect(store.allVideos).toHaveLength(1)
      expect(store.allVideos[0].title).toBe('動画1')
      expect(store.videosStatus).toBe('ready')
    })

    it('status が ready の場合は再取得しない（force=false）', async () => {
      mockApiFn.mockResolvedValueOnce({
        videos: [],
        meta: { page: 1, per_page: 200, total_results: 0, total_pages: 1 },
      } satisfies VideosResponse)

      const store = useLibraryStore()
      await store.fetchVideos()
      await store.fetchVideos()

      expect(mockApiFn).toHaveBeenCalledTimes(1)
    })

    it('API がエラーを投げたとき videosStatus が error になる', async () => {
      mockApiFn.mockRejectedValueOnce(new Error('Fetch failed'))

      const store = useLibraryStore()
      await store.fetchVideos()

      expect(store.videosStatus).toBe('error')
      expect(store.videosError?.message).toBe('Fetch failed')
    })
  })
})
