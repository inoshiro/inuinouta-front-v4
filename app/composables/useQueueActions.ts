import type { Song } from '~/types'

export function useQueueActions() {
  const player = usePlayerStore()
  const queue = useQueueStore()
  const { requestPlay } = useYouTubePlayer()
  const { success } = useNotifications()
  const { trackAddToQueue, trackAddAllToQueue } = useAnalytics()

  /** Replace queue and play from a specific index */
  function playAll(songs: Song[], startIndex = 0) {
    queue.setSongs(songs, startIndex)
    const current = queue.currentSong
    if (!current) return
    player.play(current)
    // Call requestPlay synchronously within the user-gesture chain.
    requestPlay(current)
    trackAddAllToQueue(songs.length, 'play_all')
  }

  /** Replace queue with a single song and play it */
  function playSong(song: Song) {
    queue.setSongs([song], 0)
    player.play(song)
    // Call requestPlay synchronously within the user-gesture chain.
    requestPlay(song)
    trackAddToQueue(song, 'play_single')
  }

  /** Insert as next in queue */
  function playNext(song: Song) {
    queue.addSongNext(song)
    success(`「${song.title}」を次に再生します`)
    trackAddToQueue(song, 'next')
  }

  /** Add to end of queue. If the queue was empty, start playback immediately. */
  function addToQueue(song: Song) {
    const wasEmpty = queue.songs.length === 0
    queue.addSong(song)
    if (wasEmpty) {
      player.play(song)
      // Call requestPlay synchronously within the user-gesture chain.
      requestPlay(song)
    } else {
      success(`「${song.title}」をキューに追加しました`)
    }
    trackAddToQueue(song, 'append')
  }

  /** Add multiple songs to end of queue with a single toast */
  function addAllToQueue(songs: Song[]) {
    if (songs.length === 0) return
    const wasEmpty = queue.songs.length === 0
    songs.forEach((song) => queue.addSong(song))
    if (wasEmpty) {
      const first = queue.currentSong
      if (first) {
        player.play(first)
        // Call requestPlay synchronously within the user-gesture chain.
        requestPlay(first)
      }
    } else {
      success(`${songs.length}曲をキューに追加しました`)
    }
    trackAddAllToQueue(songs.length, 'bulk')
  }

  return { playAll, playSong, playNext, addToQueue, addAllToQueue }
}
