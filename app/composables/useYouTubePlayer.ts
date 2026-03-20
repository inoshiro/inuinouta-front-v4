export function useYouTubePlayer() {
  const player = usePlayerStore()

  const ready = ref(false)
  let ytPlayer: YT.Player | null = null
  let intervalId: ReturnType<typeof setInterval> | null = null

  function loadApi(): Promise<void> {
    return new Promise((resolve) => {
      if (window.YT?.Player) {
        resolve()
        return
      }
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
      window.onYouTubeIframeAPIReady = () => resolve()
    })
  }

  async function initPlayer(elementId: string) {
    await loadApi()
    ytPlayer = new window.YT.Player(elementId, {
      height: '0',
      width: '0',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
      },
      events: {
        onReady: () => {
          ready.value = true
        },
        onStateChange: handleStateChange,
      },
    })
  }

  function handleStateChange(event: YT.OnStateChangeEvent) {
    // YT.PlayerState.ENDED === 0
    if (event.data === 0) {
      onSongEnd()
    }
  }

  function onSongEnd() {
    const { nextSong } = usePlayback()
    nextSong()
  }

  function startTimeTracking() {
    stopTimeTracking()
    intervalId = setInterval(() => {
      if (ytPlayer && player.isPlaying) {
        const time = ytPlayer.getCurrentTime()
        player.updateTime(time)

        const song = player.currentSong
        if (song && song.end_at > 0 && time >= song.end_at) {
          onSongEnd()
        }
      }
    }, 500)
  }

  function stopTimeTracking() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function seekTo(seconds: number) {
    ytPlayer?.seekTo(seconds, true)
    player.updateTime(seconds)
  }

  function destroy() {
    stopTimeTracking()
    ytPlayer?.destroy()
    ytPlayer = null
    ready.value = false
  }

  // Watch currentSong — load video when song changes
  watch(
    () => player.currentSong,
    (song) => {
      if (!song || !ytPlayer) return
      ytPlayer.loadVideoById({
        videoId: song.video.id,
        startSeconds: song.start_at,
        endSeconds: song.end_at > 0 ? song.end_at : undefined,
      })
      startTimeTracking()
    },
  )

  // Watch play/pause state
  watch(
    () => player.isPlaying,
    (playing) => {
      if (!ytPlayer) return
      if (playing) ytPlayer.playVideo()
      else ytPlayer.pauseVideo()
    },
  )

  // Watch volume
  watch(
    () => player.volume,
    (vol) => {
      ytPlayer?.setVolume(vol)
    },
  )

  // Watch mute
  watch(
    () => player.isMuted,
    (muted) => {
      if (muted) ytPlayer?.mute()
      else ytPlayer?.unMute()
    },
  )

  return {
    ready: readonly(ready),
    initPlayer,
    seekTo,
    destroy,
  }
}
