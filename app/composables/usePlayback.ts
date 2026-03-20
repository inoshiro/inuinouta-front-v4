export function usePlayback() {
  const player = usePlayerStore()
  const queue = useQueueStore()

  function togglePlay() {
    if (player.isPlaying) player.pause()
    else player.resume()
  }

  function nextSong() {
    const song = queue.next()
    if (song) player.play(song)
    else player.stop()
  }

  function previousSong() {
    const song = queue.previous()
    if (song) player.play(song)
  }

  return { togglePlay, nextSong, previousSong }
}
