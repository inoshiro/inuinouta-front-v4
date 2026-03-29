import type { Song } from '~/types'

export function useQueueActions() {
  const player = usePlayerStore()
  const queue = useQueueStore()
  const { requestPlay } = useYouTubePlayer()

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
  }

  return { playAll, playSong, playNext, addToQueue }
}
