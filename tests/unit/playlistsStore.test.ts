import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
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

describe('usePlaylistsStore - favorites', () => {
  beforeEach(() => {
    localStorageMock.clear()
    setActivePinia(createPinia())
  })

  it('loadFromStorage 後に favorites プレイリストが先頭に存在する', () => {
    const store = usePlaylistsStore()
    store.loadFromStorage()
    expect(store.playlists.length).toBeGreaterThanOrEqual(1)
    expect(store.playlists[0]?.id).toBe(FAVORITES_PLAYLIST_ID)
    expect(store.playlists[0]?.kind).toBe('favorites')
  })

  it('localStorage にデータがある場合も favorites が先頭に挿入される', () => {
    const existing = [
      {
        id: 'abc',
        name: 'My list',
        description: '',
        items: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]
    localStorageMock.setItem('local_playlists', JSON.stringify(existing))
    const store = usePlaylistsStore()
    store.loadFromStorage()
    expect(store.playlists[0]?.id).toBe(FAVORITES_PLAYLIST_ID)
    expect(store.playlists.length).toBe(2)
  })

  it('isFavorite は未追加の楽曲で false を返す', () => {
    const store = usePlaylistsStore()
    store.loadFromStorage()
    expect(store.isFavorite(1)).toBe(false)
  })

  it('addFavorite で楽曲が追加され isFavorite が true になる', () => {
    const store = usePlaylistsStore()
    store.loadFromStorage()
    store.addFavorite(42)
    expect(store.isFavorite(42)).toBe(true)
    const fav = store.getById(FAVORITES_PLAYLIST_ID)
    expect(fav?.items.length).toBe(1)
    expect(fav?.items[0]?.song_id).toBe(42)
  })

  it('addFavorite は同じ song_id を重複登録しない', () => {
    const store = usePlaylistsStore()
    store.loadFromStorage()
    store.addFavorite(42)
    store.addFavorite(42)
    const fav = store.getById(FAVORITES_PLAYLIST_ID)
    expect(fav?.items.length).toBe(1)
  })

  it('removeFavorite で楽曲が削除され isFavorite が false になる', () => {
    const store = usePlaylistsStore()
    store.loadFromStorage()
    store.addFavorite(42)
    store.removeFavorite(42)
    expect(store.isFavorite(42)).toBe(false)
  })

  it('toggleFavorite は追加と削除を交互に行う', () => {
    const store = usePlaylistsStore()
    store.loadFromStorage()
    store.toggleFavorite(99)
    expect(store.isFavorite(99)).toBe(true)
    store.toggleFavorite(99)
    expect(store.isFavorite(99)).toBe(false)
  })

  it('updatePlaylist は favorites に対して no-op', () => {
    const store = usePlaylistsStore()
    store.loadFromStorage()
    store.updatePlaylist(FAVORITES_PLAYLIST_ID, { name: 'Hacked' })
    expect(store.getById(FAVORITES_PLAYLIST_ID)?.name).toBe('お気に入り')
  })

  it('deletePlaylist は favorites に対して no-op', () => {
    const store = usePlaylistsStore()
    store.loadFromStorage()
    store.deletePlaylist(FAVORITES_PLAYLIST_ID)
    expect(store.getById(FAVORITES_PLAYLIST_ID)).toBeDefined()
  })

  it('loadFromStorage を 2 回呼んでも favorites が 1 つだけ存在する', () => {
    const store = usePlaylistsStore()
    store.loadFromStorage()
    // loaded フラグにより 2 回目はスキップされるが、favorites は維持される
    store.loadFromStorage()
    const favCount = store.playlists.filter((p) => p.id === FAVORITES_PLAYLIST_ID).length
    expect(favCount).toBe(1)
  })
})
