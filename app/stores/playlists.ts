import type { LocalPlaylist, LocalPlaylistItem } from '~/types'

const STORAGE_KEY = 'local_playlists'

export const usePlaylistsStore = defineStore('playlists', () => {
  const playlists = ref<LocalPlaylist[]>([])
  const loaded = ref(false)

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
    if (data.name !== undefined) playlist.name = data.name
    if (data.description !== undefined) playlist.description = data.description
    playlist.updated_at = new Date().toISOString()
    saveToStorage()
  }

  function deletePlaylist(id: string) {
    const index = playlists.value.findIndex((p) => p.id === id)
    if (index === -1) return
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
  }
})
