import type { LocalPlaylist } from '~/types'

export function usePlaylistActions() {
  const playlistsStore = usePlaylistsStore()
  const { success } = useNotifications()

  /** Add a single song to an existing playlist */
  function addSongToPlaylist(playlistId: string, songId: number, songTitle: string) {
    const pl = playlistsStore.getById(playlistId)
    if (!pl) return
    playlistsStore.addSong(playlistId, songId)
    success(`「${songTitle}」を「${pl.name}」に追加しました`, `/playlists/${playlistId}`)
  }

  /** Create a new playlist and add a single song to it */
  function createPlaylistWithSong(name: string, songId: number): LocalPlaylist {
    const created = playlistsStore.createPlaylist(name, '', [songId])
    success(`プレイリスト「${name}」を作成して追加しました`, `/playlists/${created.id}`)
    return created
  }

  /** Create a new playlist with an empty song list */
  function createPlaylist(name: string): LocalPlaylist {
    const created = playlistsStore.createPlaylist(name)
    success(`プレイリスト「${name}」を作成しました`, `/playlists/${created.id}`)
    return created
  }

  /** Create a new playlist from multiple songs (e.g. from queue) */
  function createPlaylistWithSongs(name: string, songIds: number[]): LocalPlaylist {
    const created = playlistsStore.createPlaylist(name, '', songIds)
    success(
      `プレイリスト「${name}」を作成しました（${songIds.length}曲）`,
      `/playlists/${created.id}`,
    )
    return created
  }

  /** Add multiple songs to an existing playlist (e.g. from queue) */
  function addSongsToPlaylist(playlistId: string, songIds: number[]) {
    const pl = playlistsStore.getById(playlistId)
    if (!pl) return
    playlistsStore.addSongs(playlistId, songIds)
    success(`「${pl.name}」に${songIds.length}曲を追加しました`, `/playlists/${playlistId}`)
  }

  /** Rename a playlist (no toast — user sees the result inline) */
  function renamePlaylist(playlistId: string, name: string) {
    playlistsStore.updatePlaylist(playlistId, { name })
  }

  /** Remove a single song from a playlist */
  function removeSongFromPlaylist(playlistId: string, itemId: string) {
    playlistsStore.removeSong(playlistId, itemId)
  }

  /** Delete a playlist, show toast, and navigate to the list */
  function deletePlaylist(playlistId: string, playlistName: string) {
    playlistsStore.deletePlaylist(playlistId)
    success(`「${playlistName}」を削除しました`)
    navigateTo('/playlists')
  }

  return {
    addSongToPlaylist,
    createPlaylistWithSong,
    createPlaylist,
    createPlaylistWithSongs,
    addSongsToPlaylist,
    renamePlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
  }
}
