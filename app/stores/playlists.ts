import type { LocalPlaylist, LocalPlaylistItem } from '~/types'

const STORAGE_KEY = 'local_playlists'
export const FAVORITES_PLAYLIST_ID = 'favorites'

function buildFavoritesPlaylist(): LocalPlaylist {
  const now = new Date().toISOString()
  return {
    id: FAVORITES_PLAYLIST_ID,
    name: 'お気に入り',
    description: '',
    items: [],
    created_at: now,
    updated_at: now,
    kind: 'favorites',
  }
}

export const usePlaylistsStore = defineStore('playlists', () => {
  const playlists = ref<LocalPlaylist[]>([])
  const loaded = ref(false)

  /** Ensure the favorites playlist always exists at the front */
  function ensureFavoritesPlaylist() {
    const exists = playlists.value.some((p) => p.id === FAVORITES_PLAYLIST_ID)
    if (!exists) {
      playlists.value.unshift(buildFavoritesPlaylist())
    } else {
      // Move favorites to front if it isn't already
      const idx = playlists.value.findIndex((p) => p.id === FAVORITES_PLAYLIST_ID)
      if (idx > 0) {
        const [fav] = playlists.value.splice(idx, 1)
        playlists.value.unshift(fav!)
      }
    }
  }

  function loadFromStorage() {
    if (loaded.value) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        playlists.value = JSON.parse(raw) as LocalPlaylist[]
      }
    } catch {
      playlists.value = []
    }
    ensureFavoritesPlaylist()
    loaded.value = true
  }

  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists.value))
    } catch {
      // Ignore storage errors (quota exceeded, private mode)
    }
  }

  function getById(id: string): LocalPlaylist | undefined {
    return playlists.value.find((p) => p.id === id)
  }

  function createPlaylist(name: string, description = '', songIds: number[] = []): LocalPlaylist {
    const now = new Date().toISOString()
    const items: LocalPlaylistItem[] = songIds.map((songId, i) => ({
      id: crypto.randomUUID(),
      song_id: songId,
      order: i,
    }))
    const playlist: LocalPlaylist = {
      id: crypto.randomUUID(),
      name,
      description,
      items,
      created_at: now,
      updated_at: now,
    }
    playlists.value.push(playlist)
    saveToStorage()
    return playlist
  }

  function updatePlaylist(id: string, data: { name?: string; description?: string }) {
    const playlist = getById(id)
    if (!playlist) return
    if (playlist.kind === 'favorites') return // system playlist: no-op
    if (data.name !== undefined) playlist.name = data.name
    if (data.description !== undefined) playlist.description = data.description
    playlist.updated_at = new Date().toISOString()
    saveToStorage()
  }

  function deletePlaylist(id: string) {
    const index = playlists.value.findIndex((p) => p.id === id)
    if (index === -1) return
    if (playlists.value[index]?.kind === 'favorites') return // system playlist: no-op
    playlists.value.splice(index, 1)
    saveToStorage()
  }

  function addSong(playlistId: string, songId: number) {
    const playlist = getById(playlistId)
    if (!playlist) return
    playlist.items.push({
      id: crypto.randomUUID(),
      song_id: songId,
      order: playlist.items.length,
    })
    playlist.updated_at = new Date().toISOString()
    saveToStorage()
  }

  function addSongs(playlistId: string, songIds: number[]) {
    const playlist = getById(playlistId)
    if (!playlist || songIds.length === 0) return
    songIds.forEach((songId) => {
      playlist.items.push({
        id: crypto.randomUUID(),
        song_id: songId,
        order: playlist.items.length,
      })
    })
    playlist.updated_at = new Date().toISOString()
    saveToStorage()
  }

  function removeSong(playlistId: string, itemId: string) {
    const playlist = getById(playlistId)
    if (!playlist) return
    const index = playlist.items.findIndex((item) => item.id === itemId)
    if (index === -1) return
    playlist.items.splice(index, 1)
    playlist.items.forEach((item, i) => {
      item.order = i
    })
    playlist.updated_at = new Date().toISOString()
    saveToStorage()
  }

  function reorderItems(playlistId: string, from: number, to: number) {
    const playlist = getById(playlistId)
    if (!playlist || from === to) return
    const [moved] = playlist.items.splice(from, 1)
    if (!moved) return
    playlist.items.splice(to, 0, moved)
    playlist.items.forEach((item, i) => {
      item.order = i
    })
    playlist.updated_at = new Date().toISOString()
    saveToStorage()
  }

  // --- Favorites helpers ---

  function isFavorite(songId: number): boolean {
    const fav = getById(FAVORITES_PLAYLIST_ID)
    return fav?.items.some((item) => item.song_id === songId) ?? false
  }

  function addFavorite(songId: number) {
    ensureFavoritesPlaylist()
    const fav = getById(FAVORITES_PLAYLIST_ID)
    if (!fav) return
    if (fav.items.some((item) => item.song_id === songId)) return // no duplicates
    fav.items.push({
      id: crypto.randomUUID(),
      song_id: songId,
      order: fav.items.length,
    })
    fav.updated_at = new Date().toISOString()
    saveToStorage()
  }

  function removeFavorite(songId: number) {
    const fav = getById(FAVORITES_PLAYLIST_ID)
    if (!fav) return
    const idx = fav.items.findIndex((item) => item.song_id === songId)
    if (idx === -1) return
    fav.items.splice(idx, 1)
    fav.items.forEach((item, i) => {
      item.order = i
    })
    fav.updated_at = new Date().toISOString()
    saveToStorage()
  }

  function toggleFavorite(songId: number) {
    if (isFavorite(songId)) {
      removeFavorite(songId)
    } else {
      addFavorite(songId)
    }
  }

  return {
    playlists: readonly(playlists),
    loaded: readonly(loaded),
    loadFromStorage,
    getById,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addSong,
    addSongs,
    removeSong,
    reorderItems,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  }
})
