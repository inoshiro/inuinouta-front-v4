import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { Song } from '~/types'

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

// --- モック ---
// Pinia の Setup store はアクセス時に ref をアンラップするため、
// モックも同様に plain array / plain value を持つ reactive オブジェクトで返す

type SongsFetchStatus = 'idle' | 'pending' | 'ready' | 'error'

const mockStore = reactive({
  allSongs: [] as Song[],
  songsStatus: 'ready' as SongsFetchStatus,
  songsError: null as Error | null,
  fetchSongs: vi.fn(),
})

mockNuxtImport('useLibraryStore', () => {
  return () => mockStore
})

// callOnce は fetchSongs を呼び出すだけの no-op にする
mockNuxtImport('callOnce', () => {
  return (_key: string, fn: () => unknown) => fn()
})

// --- テスト ---

describe('useSongs', () => {
  beforeEach(() => {
    mockStore.allSongs = []
    mockStore.songsStatus = 'ready'
    mockStore.songsError = null
    mockStore.fetchSongs.mockReset()
  })

  describe('フィルタリング', () => {
    it('search が空のとき全件を返す', () => {
      mockStore.allSongs = [makeSong(1, 'Ado - うっせぇわ'), makeSong(2, 'YOASOBI - 夜に駆ける')]
      const { songs, totalItems } = useSongs({ perPage: 10 })

      expect(songs.value).toHaveLength(2)
      expect(totalItems.value).toBe(2)
    })

    it('search キーワードでタイトルの部分一致フィルタができる', () => {
      mockStore.allSongs = [makeSong(1, 'Ado - うっせぇわ'), makeSong(2, 'YOASOBI - 夜に駆ける')]
      const { songs, search, totalItems } = useSongs({ perPage: 10 })
      search.value = 'yoasobi'

      expect(songs.value).toHaveLength(1)
      expect(songs.value[0].title).toBe('YOASOBI - 夜に駆ける')
      expect(totalItems.value).toBe(1)
    })

    it('フィルタは大文字小文字を区別しない', () => {
      mockStore.allSongs = [makeSong(1, 'Ado - うっせぇわ')]
      const { songs, search } = useSongs({ perPage: 10 })
      search.value = 'ADO'

      expect(songs.value).toHaveLength(1)
    })

    it('一致しないキーワードで空配列を返す', () => {
      mockStore.allSongs = [makeSong(1, 'Ado - うっせぇわ')]
      const { songs, search } = useSongs({ perPage: 10 })
      search.value = '存在しない曲名'

      expect(songs.value).toHaveLength(0)
    })
  })

  describe('ページング', () => {
    it('perPage 件ずつスライスされる（1 ページ目）', () => {
      mockStore.allSongs = Array.from({ length: 25 }, (_, i) => makeSong(i + 1, `曲${i + 1}`))
      const { songs } = useSongs({ perPage: 10 })

      expect(songs.value).toHaveLength(10)
      expect(songs.value[0].id).toBe(1)
    })

    it('page を変えると対応するスライスが返る', () => {
      mockStore.allSongs = Array.from({ length: 25 }, (_, i) => makeSong(i + 1, `曲${i + 1}`))
      const { songs, page } = useSongs({ perPage: 10 })
      page.value = 2

      expect(songs.value).toHaveLength(10)
      expect(songs.value[0].id).toBe(11)
    })

    it('最終ページは端数件数になる', () => {
      mockStore.allSongs = Array.from({ length: 25 }, (_, i) => makeSong(i + 1, `曲${i + 1}`))
      const { songs, page } = useSongs({ perPage: 10 })
      page.value = 3

      expect(songs.value).toHaveLength(5)
    })
  })

  describe('search 変更時のページリセット', () => {
    it('search を変更すると page が 1 にリセットされる', async () => {
      mockStore.allSongs = Array.from({ length: 25 }, (_, i) => makeSong(i + 1, `曲${i + 1}`))
      const { page, search } = useSongs({ perPage: 10 })
      page.value = 3

      search.value = '曲'
      await nextTick()

      expect(page.value).toBe(1)
    })
  })

  describe('status', () => {
    it('store が idle のとき pending を返す', () => {
      mockStore.songsStatus = 'idle'
      const { status } = useSongs()

      expect(status.value).toBe('pending')
    })

    it('store が ready のとき ready を返す', () => {
      mockStore.songsStatus = 'ready'
      const { status } = useSongs()

      expect(status.value).toBe('ready')
    })

    it('store が error のとき error を返す', () => {
      mockStore.songsStatus = 'error'
      const { status } = useSongs()

      expect(status.value).toBe('error')
    })
  })

  describe('refresh', () => {
    it('refresh() を呼ぶと store の fetchSongs(true) が呼ばれる', () => {
      const { refresh } = useSongs()
      refresh()

      expect(mockStore.fetchSongs).toHaveBeenCalledWith(true)
    })
  })

  describe('filteredSongs と songs の分離', () => {
    it('filteredSongs は絞り込み全件、songs は perPage 件のスライスを返す', () => {
      mockStore.allSongs = Array.from({ length: 60 }, (_, i) => makeSong(i + 1, `曲${i + 1}`))
      const { filteredSongs, songs } = useSongs({ perPage: 10 })

      expect(filteredSongs.value).toHaveLength(60)
      expect(songs.value).toHaveLength(10)
    })

    it('2 ページ目を表示中でも filteredSongs は全件を保持する', () => {
      mockStore.allSongs = Array.from({ length: 60 }, (_, i) => makeSong(i + 1, `曲${i + 1}`))
      const { filteredSongs, songs, page } = useSongs({ perPage: 10 })
      page.value = 2

      expect(filteredSongs.value).toHaveLength(60)
      expect(songs.value[0].id).toBe(11)
    })

    it('search 絞り込み後、filteredSongs は絞り込み全件、songs はそのスライスを返す', () => {
      mockStore.allSongs = [
        ...Array.from({ length: 55 }, (_, i) => makeSong(i + 1, `Ado - 曲${i + 1}`)),
        makeSong(56, 'YOASOBI - 夜に駆ける'),
      ]
      const { filteredSongs, songs, search } = useSongs({ perPage: 10 })
      search.value = 'ado'

      expect(filteredSongs.value).toHaveLength(55)
      expect(songs.value).toHaveLength(10)
      expect(songs.value[0].title).toContain('Ado')
    })
  })
})
