import type { LocalPlaylist } from '~/types'

export function usePlaylistActions() {
  const playlistsStore = usePlaylistsStore()
  const { success } = useNotifications()
  const { trackPlaylistAction } = useAnalytics()

  /** Add a single song to an existing playlist */
  function addSongToPlaylist(playlistId: string, songId: number, songTitle: string) {
    const pl = playlistsStore.getById(playlistId)
    if (!pl) return
    playlistsStore.addSong(playlistId, songId)
    success(`「${songTitle}」を「${pl.name}」に追加しました`, `/playlists/${playlistId}`)
    trackPlaylistAction('add_song', pl, { song_id: songId })
  }

  /** Create a new playlist and add a single song to it */
  function createPlaylistWithSong(name: string, songId: number): LocalPlaylist {
    const created = playlistsStore.createPlaylist(name, '', [songId])
    success(`プレイリスト「${name}」を作成して追加しました`, `/playlists/${created.id}`)
    trackPlaylistAction('create', created, { song_id: songId })
    return created
  }

  /** Create a new playlist with an empty song list */
  function createPlaylist(name: string): LocalPlaylist {
    const created = playlistsStore.createPlaylist(name)
    success(`プレイリスト「${name}」を作成しました`, `/playlists/${created.id}`)
    trackPlaylistAction('create', created)
    return created
  }

  /** Create a new playlist from multiple songs (e.g. from queue) */
  function createPlaylistWithSongs(name: string, songIds: number[]): LocalPlaylist {
    const created = playlistsStore.createPlaylist(name, '', songIds)
    success(
      `プレイリスト「${name}」を作成しました（${songIds.length}曲）`,
      `/playlists/${created.id}`,
    )
    trackPlaylistAction('create', created, { count: songIds.length })
    return created
  }

  /** Add multiple songs to an existing playlist (e.g. from queue) */
  function addSongsToPlaylist(playlistId: string, songIds: number[]) {
    const pl = playlistsStore.getById(playlistId)
    if (!pl) return
    playlistsStore.addSongs(playlistId, songIds)
    success(`「${pl.name}」に${songIds.length}曲を追加しました`, `/playlists/${playlistId}`)
    trackPlaylistAction('add_songs', pl, { count: songIds.length })
  }

  /** Rename a playlist (no toast — user sees the result inline) */
  function renamePlaylist(playlistId: string, name: string) {
    playlistsStore.updatePlaylist(playlistId, { name })
    const pl = playlistsStore.getById(playlistId)
    if (pl) trackPlaylistAction('rename', pl)
  }

  /** Remove a single song from a playlist */
  function removeSongFromPlaylist(playlistId: string, itemId: string) {
    playlistsStore.removeSong(playlistId, itemId)
    const pl = playlistsStore.getById(playlistId)
    if (pl) trackPlaylistAction('remove_song', pl)
  }

  /** Delete a playlist, show toast, and navigate to the list */
  function deletePlaylist(playlistId: string, playlistName: string) {
    playlistsStore.deletePlaylist(playlistId)
    success(`「${playlistName}」を削除しました`)
    navigateTo('/playlists')
    trackPlaylistAction('delete', { id: playlistId, name: playlistName })
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
