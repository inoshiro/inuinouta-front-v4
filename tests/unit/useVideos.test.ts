import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { VideoList } from '~/types'

// --- テスト用データ生成ヘルパー ---

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

// --- モック ---
// Pinia の Setup store はアクセス時に ref をアンラップするため、
// モックも同様に plain array / plain value を持つ reactive オブジェクトで返す

type VideosFetchStatus = 'idle' | 'pending' | 'ready' | 'error'

const mockStore = reactive({
  allVideos: [] as VideoList[],
  videosStatus: 'ready' as VideosFetchStatus,
  videosError: null as Error | null,
  fetchVideos: vi.fn(),
})

mockNuxtImport('useLibraryStore', () => {
  return () => mockStore
})

mockNuxtImport('callOnce', () => {
  return (_key: string, fn: () => unknown) => fn()
})

// --- テスト ---

describe('useVideos', () => {
  beforeEach(() => {
    mockStore.allVideos = []
    mockStore.videosStatus = 'ready'
    mockStore.videosError = null
    mockStore.fetchVideos.mockReset()
  })

  describe('フィルタリング', () => {
    it('search が空のとき全件を返す', () => {
      mockStore.allVideos = [
        makeVideo('v1', '歌ってみた vol.1'),
        makeVideo('v2', '歌ってみた vol.2'),
      ]
      const { videos, totalItems } = useVideos({ perPage: 10 })

      expect(videos.value).toHaveLength(2)
      expect(totalItems.value).toBe(2)
    })

    it('search キーワードでタイトルの部分一致フィルタができる', () => {
      mockStore.allVideos = [makeVideo('v1', '歌ってみた vol.1'), makeVideo('v2', 'オリジナル楽曲')]
      const { videos, search, totalItems } = useVideos({ perPage: 10 })
      search.value = 'オリジナル'

      expect(videos.value).toHaveLength(1)
      expect(videos.value[0].title).toBe('オリジナル楽曲')
      expect(totalItems.value).toBe(1)
    })

    it('フィルタは大文字小文字を区別しない', () => {
      mockStore.allVideos = [makeVideo('v1', 'Piano Cover')]
      const { videos, search } = useVideos({ perPage: 10 })
      search.value = 'piano'

      expect(videos.value).toHaveLength(1)
    })

    it('一致しないキーワードで空配列を返す', () => {
      mockStore.allVideos = [makeVideo('v1', '歌ってみた')]
      const { videos, search } = useVideos({ perPage: 10 })
      search.value = '存在しないタイトル'

      expect(videos.value).toHaveLength(0)
    })
  })

  describe('ページング', () => {
    it('perPage 件ずつスライスされる（1 ページ目）', () => {
      mockStore.allVideos = Array.from({ length: 25 }, (_, i) =>
        makeVideo(`v${i + 1}`, `動画${i + 1}`),
      )
      const { videos } = useVideos({ perPage: 10 })

      expect(videos.value).toHaveLength(10)
      expect(videos.value[0].id).toBe('v1')
    })

    it('page を変えると対応するスライスが返る', () => {
      mockStore.allVideos = Array.from({ length: 25 }, (_, i) =>
        makeVideo(`v${i + 1}`, `動画${i + 1}`),
      )
      const { videos, page } = useVideos({ perPage: 10 })
      page.value = 2

      expect(videos.value).toHaveLength(10)
      expect(videos.value[0].id).toBe('v11')
    })

    it('最終ページは端数件数になる', () => {
      mockStore.allVideos = Array.from({ length: 25 }, (_, i) =>
        makeVideo(`v${i + 1}`, `動画${i + 1}`),
      )
      const { videos, page } = useVideos({ perPage: 10 })
      page.value = 3

      expect(videos.value).toHaveLength(5)
    })
  })

  describe('search 変更時のページリセット', () => {
    it('search を変更すると page が 1 にリセットされる', async () => {
      mockStore.allVideos = Array.from({ length: 25 }, (_, i) =>
        makeVideo(`v${i + 1}`, `動画${i + 1}`),
      )
      const { page, search } = useVideos({ perPage: 10 })
      page.value = 3

      search.value = '動画'
      await nextTick()

      expect(page.value).toBe(1)
    })
  })

  describe('status', () => {
    it('store が idle のとき pending を返す', () => {
      mockStore.videosStatus = 'idle'
      const { status } = useVideos()

      expect(status.value).toBe('pending')
    })

    it('store が ready のとき ready を返す', () => {
      mockStore.videosStatus = 'ready'
      const { status } = useVideos()

      expect(status.value).toBe('ready')
    })

    it('store が error のとき error を返す', () => {
      mockStore.videosStatus = 'error'
      const { status } = useVideos()

      expect(status.value).toBe('error')
    })
  })

  describe('refresh', () => {
    it('refresh() を呼ぶと store の fetchVideos(true) が呼ばれる', () => {
      const { refresh } = useVideos()
      refresh()

      expect(mockStore.fetchVideos).toHaveBeenCalledWith(true)
    })
  })
})
