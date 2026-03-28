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
      player.stop()
    }
  }

  function previousSong() {
    const song = queue.previous()
    if (song) {
      player.play(song)
      requestPlay(song)
    }
  }

  return { togglePlay, nextSong, previousSong }
}
