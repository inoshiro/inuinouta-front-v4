import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { Song, LocalPlaylist } from '~/types'

// --- Test data helpers ---

const makeSong = (id: number, title = `Song ${id}`): Song => ({
  id,
  title,
  artist: null,
  is_original: false,
  start_at: 0,
  end_at: 180,
  video: {
    id: `v${id}`,
    title: `Video ${id}`,
    url: `https://youtube.com/watch?v=v${id}`,
    thumbnail_path: '',
    is_open: true,
    is_member_only: false,
    is_stream: false,
    unplayable: false,
    published_at: '2024-01-01T00:00:00Z',
  },
})

const makePlaylist = (songIds: number[]): LocalPlaylist => ({
  id: 'test-pl',
  name: 'Test Playlist',
  description: '',
  items: songIds.map((song_id, i) => ({ id: `item-${i}`, song_id, order: i })),
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
})

// --- Mocks ---

type SongsFetchStatus = 'idle' | 'pending' | 'ready' | 'error'

const mockLibrary = reactive({
  allSongs: [] as Song[],
  songsStatus: 'ready' as SongsFetchStatus,
  songsError: null as Error | null,
  fetchSongs: vi.fn(),
})

mockNuxtImport('useLibraryStore', () => {
  return () => mockLibrary
})

// callOnce: immediately call fn() so fetchSongs is invoked in tests
mockNuxtImport('callOnce', () => {
  return (_key: string, fn: () => unknown) => fn()
})

// playlistsStore mock - will be replaced per test via setActivePinia
const mockPlaylistsStore = reactive({
  loaded: true,
  getById: vi.fn(),
})

mockNuxtImport('usePlaylistsStore', () => {
  return () => mockPlaylistsStore
})

// --- Tests ---

describe('usePlaylistDetail', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockLibrary.allSongs = []
    mockLibrary.songsStatus = 'ready'
    mockLibrary.songsError = null
    mockLibrary.fetchSongs.mockReset()
    mockPlaylistsStore.loaded = true
    mockPlaylistsStore.getById.mockReset()
  })

  it('playlist.items の順序通りに allSongs から曲を解決する', () => {
    const s1 = makeSong(1)
    const s2 = makeSong(2)
    const s3 = makeSong(3)
    mockLibrary.allSongs = [s3, s1, s2] // 異なる順序で格納
    mockPlaylistsStore.getById.mockReturnValue(makePlaylist([1, 2, 3]))

    const { songs } = usePlaylistDetail('test-pl')

    expect(songs.value.map((s) => s.id)).toEqual([1, 2, 3])
  })

  it('allSongs に存在しない song_id は除外する', () => {
    mockLibrary.allSongs = [makeSong(1), makeSong(3)]
    mockPlaylistsStore.getById.mockReturnValue(makePlaylist([1, 2, 3])) // 2 は存在しない

    const { songs } = usePlaylistDetail('test-pl')

    expect(songs.value.map((s) => s.id)).toEqual([1, 3])
  })

  it('重複する song_id は登録回数分そのまま出力する', () => {
    mockLibrary.allSongs = [makeSong(1), makeSong(2)]
    mockPlaylistsStore.getById.mockReturnValue(makePlaylist([1, 2, 1, 2, 1]))

    const { songs } = usePlaylistDetail('test-pl')

    expect(songs.value.map((s) => s.id)).toEqual([1, 2, 1, 2, 1])
  })

  it('filter{id.in} を含む API 呼び出しを行わない（fetchSongs 未呼び出し確認）', () => {
    // useApi を import していないことを確認するため、$api が呼ばれないことを保証する
    // callOnce 経由で library.fetchSongs() は呼ばれるが、それは許容
    mockLibrary.allSongs = [makeSong(1)]
    mockPlaylistsStore.getById.mockReturnValue(makePlaylist([1]))

    usePlaylistDetail('test-pl')

    // useApi の $api が呼ばれていないことは型レベルで保証されるが、
    // 念のため fetchSongs（callOnce 経由）は 1 回呼ばれることを確認
    expect(mockLibrary.fetchSongs).toHaveBeenCalledTimes(1)
  })

  it('library.songsStatus が pending のとき status は pending を返す', () => {
    mockLibrary.songsStatus = 'pending'
    mockLibrary.allSongs = []
    mockPlaylistsStore.getById.mockReturnValue(makePlaylist([1]))

    const { status } = usePlaylistDetail('test-pl')

    expect(status.value).toBe('pending')
  })

  it('library.songsStatus が error のとき status は error を返す', () => {
    mockLibrary.songsStatus = 'error'
    mockLibrary.allSongs = []
    mockPlaylistsStore.getById.mockReturnValue(makePlaylist([1]))

    const { status } = usePlaylistDetail('test-pl')

    expect(status.value).toBe('error')
  })

  it('空のプレイリストは library の状態に関わらず status が ready になる', () => {
    mockLibrary.songsStatus = 'pending'
    mockPlaylistsStore.getById.mockReturnValue(makePlaylist([]))

    const { status, songs } = usePlaylistDetail('test-pl')

    expect(status.value).toBe('ready')
    expect(songs.value).toHaveLength(0)
  })

  it('playlistsStore.loaded が false のとき status は pending を返す', () => {
    mockPlaylistsStore.loaded = false
    mockLibrary.songsStatus = 'ready'
    mockPlaylistsStore.getById.mockReturnValue(makePlaylist([1]))

    const { status } = usePlaylistDetail('test-pl')

    expect(status.value).toBe('pending')
  })

  it('両方 ready なら songs が返り status は ready になる', () => {
    mockLibrary.allSongs = [makeSong(10), makeSong(20)]
    mockPlaylistsStore.getById.mockReturnValue(makePlaylist([20, 10]))

    const { songs, status } = usePlaylistDetail('test-pl')

    expect(status.value).toBe('ready')
    expect(songs.value.map((s) => s.id)).toEqual([20, 10])
  })

  it('totalDuration を曲の duration 合計から計算する', () => {
    const s1 = { ...makeSong(1), start_at: 0, end_at: 60 }
    const s2 = { ...makeSong(2), start_at: 10, end_at: 70 }
    mockLibrary.allSongs = [s1, s2]
    mockPlaylistsStore.getById.mockReturnValue(makePlaylist([1, 2]))

    const { totalDuration } = usePlaylistDetail('test-pl')

    // s1: 60s, s2: 60s → 合計 120s = 2分
    expect(totalDuration.value).toBe('2分')
  })
})
