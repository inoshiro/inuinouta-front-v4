import type { Song } from '~/types'

export function useQueueActions() {
  const player = usePlayerStore()
  const queue = useQueueStore()
  const { requestPlay } = useYouTubePlayer()
  const { success } = useNotifications()

  /** Replace queue and play from a specific index */
  function playAll(songs: Song[], startIndex = 0) {
    queue.setSongs(songs, startIndex)
    const current = queue.currentSong
    if (!current) return
    player.play(current)
    // Call requestPlay synchronously within the user-gesture chain.
    requestPlay(current)
  }

  /** Replace queue with a single song and play it */
  function playSong(song: Song) {
    queue.setSongs([song], 0)
    player.play(song)
    // Call requestPlay synchronously within the user-gesture chain.
    requestPlay(song)
  }

  /** Insert as next in queue */
  function playNext(song: Song) {
    queue.addSongNext(song)
    success(`「${song.title}」を次に再生します`)
  }

  /** Add to end of queue. If the queue was empty, start playback immediately. */
  function addToQueue(song: Song) {
    const wasEmpty = queue.songs.length === 0
    queue.addSong(song)
    if (wasEmpty) {
      player.play(song)
      // Call requestPlay synchronously within the user-gesture chain.
      requestPlay(song)
    }
    success(`「${song.title}」をキューに追加しました`)
  }

  /** Add multiple songs to end of queue with a single toast */
  function addAllToQueue(songs: Song[]) {
    if (songs.length === 0) return
    songs.forEach((song) => queue.addSong(song))
    success(`${songs.length}曲をキューに追加しました`)
  }

  return { playAll, playSong, playNext, addToQueue, addAllToQueue }
}
