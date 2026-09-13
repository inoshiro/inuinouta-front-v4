import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { usePlaylistsStore, FAVORITES_PLAYLIST_ID } from '../../app/stores/playlists'

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      store[key] = undefined as unknown as string
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

mockNuxtImport('useNotifications', () => {
  return () => ({
    success: vi.fn(),
    error: vi.fn(),
  })
})

mockNuxtImport('useAnalytics', () => {
  return () => ({
    trackPlaylistAction: vi.fn(),
  })
})

mockNuxtImport('navigateTo', () => vi.fn())

describe('usePlaylistActions - toggleFavoriteSong', () => {
  beforeEach(() => {
    localStorageMock.clear()
    setActivePinia(createPinia())
  })

  it('store が未ロード状態で toggleFavoriteSong を呼んでも、localStorage の既存 favorites が保持される', async () => {
    const favoritesPlaylist = {
      id: FAVORITES_PLAYLIST_ID,
      name: 'お気に入り',
      description: '',
      kind: 'favorites',
      items: [{ id: 'item-1', song_id: 100, order: 0 }],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
    localStorageMock.setItem('local_playlists', JSON.stringify([favoritesPlaylist]))

    // store は loaded=false の初期状態
    const store = usePlaylistsStore()
    expect(store.loaded).toBe(false)

    const { usePlaylistActions } = await import('../../app/composables/usePlaylistActions')
    const actions = usePlaylistActions()

    // 未ロード状態で新しい楽曲のトグルを呼ぶ
    actions.toggleFavoriteSong(200, 'New Song')

    // loadFromStorage が内部で呼ばれ、既存 favorites (100) が保持されている
    expect(store.isFavorite(100)).toBe(true)
    // 新規追加 (200) も追加されている
    expect(store.isFavorite(200)).toBe(true)
  })

  it('store が未ロード状態で既存 favorites の楽曲を toggleFavoriteSong しても、他の favorites が消えない', async () => {
    const favoritesPlaylist = {
      id: FAVORITES_PLAYLIST_ID,
      name: 'お気に入り',
      description: '',
      kind: 'favorites',
      items: [
        { id: 'item-1', song_id: 100, order: 0 },
        { id: 'item-2', song_id: 101, order: 1 },
      ],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }
    localStorageMock.setItem('local_playlists', JSON.stringify([favoritesPlaylist]))

    const store = usePlaylistsStore()
    expect(store.loaded).toBe(false)

    const { usePlaylistActions } = await import('../../app/composables/usePlaylistActions')
    const actions = usePlaylistActions()

    // 既存 favorites の楽曲 (100) を削除トグル
    actions.toggleFavoriteSong(100, 'Existing Song')

    // 100 は削除されているが、101 は残っている
    expect(store.isFavorite(100)).toBe(false)
    expect(store.isFavorite(101)).toBe(true)
  })
})
