export function usePlayback() {
  const player = usePlayerStore()
  const queue = useQueueStore()
  const { resumePlay, pausePlay, requestPlay } = useYouTubePlayer()

  function togglePlay() {
    if (player.isPlaying) {
      player.pause()
      pausePlay()
    } else {
      player.resume()
      resumePlay()
    }
  }

  function nextSong() {
    const song = queue.next()
    if (song) {
      player.play(song)
      requestPlay(song)
    } else {
      // End of queue (repeat off): stop playing but keep currentSong so PlayerBar stays visible.
      player.stopPlayback()
    }
  }

  function previousSong() {
    const song = queue.previous()
    if (song) {
      player.play(song)
      requestPlay(song)
    }
  }

  /**
   * Clear the queue and stop playback entirely (including hiding PlayerBar).
   * Use this instead of calling queue.clear() directly so that player state
   * stays in sync.
   */
  function clearQueue() {
    queue.clear()
    player.stop()
  }

  /**
   * Remove a song from the queue by index and keep player state in sync.
   * - If the queue becomes empty: stop playback and hide PlayerBar.
   * - If the removed song was the current one: sync player.currentSong to the
   *   new queue.currentSong (display updates without auto-playing).
   */
  function removeSongFromQueue(index: number) {
    queue.removeSong(index)
    if (queue.songs.length === 0) {
      player.stop()
    } else {
      const current = queue.currentSong
      if (current && player.currentSong?.id !== current.id) {
        player.currentSong = current
      }
    }
  }

  return { togglePlay, nextSong, previousSong, clearQueue, removeSongFromQueue }
}
