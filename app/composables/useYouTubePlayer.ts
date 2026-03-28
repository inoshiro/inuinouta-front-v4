import type { Song } from '~/types'

// ---------------------------------------------------------------------------
// Module-level singleton state
// All calls to useYouTubePlayer() share these variables so that the player
// instance initialised by YouTubeEmbed.vue is the same one used by
// PlayerBar.vue, useQueueActions, etc.
// ---------------------------------------------------------------------------

let ytPlayer: YT.Player | null = null
/** True once the IFrame API + player element are fully ready. */
const ready = ref(false)

/** Play request queued before the player was ready. */
let pendingRequest: { videoId: string; startSeconds: number; endSeconds?: number } | null = null

let intervalId: ReturnType<typeof setInterval> | null = null

// ---------------------------------------------------------------------------

export function useYouTubePlayer() {
  const player = usePlayerStore()

  // --- API loader ------------------------------------------------------------

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

  // --- Initialisation -------------------------------------------------------

  async function initPlayer(elementId: string) {
    await loadApi()
    const origin = window.location.origin
    ytPlayer = new window.YT.Player(elementId, {
      height: '1',
      width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        rel: 0,
        // Required for inline playback on iOS (prevents fullscreen takeover).
        playsinline: 1,
        // Recommended by YouTube docs; reduces cross-origin issues.
        origin,
      },
      events: {
        onReady: handleReady,
        onStateChange: handleStateChange,
        onError: handleError,
        onAutoplayBlocked: handleAutoplayBlocked,
      },
    })
  }

  // --- Event handlers -------------------------------------------------------

  function handleReady() {
    ready.value = true
    // If a play request arrived while the player was still initialising,
    // fulfil it now (note: this is not within the original user gesture, so
    // iOS may still block it — the UI will show a retry button in that case).
    if (pendingRequest) {
      const req = pendingRequest
      pendingRequest = null
      _loadAndPlay(req)
    }
  }

  function handleStateChange(event: YT.OnStateChangeEvent) {
    const state = event.data
    if (state === 1 /* PLAYING */) {
      player.setPlaying(true)
      startTimeTracking()
    } else if (state === 2 /* PAUSED */) {
      player.setPlaying(false)
      stopTimeTracking()
    } else if (state === 0 /* ENDED */) {
      stopTimeTracking()
      onSongEnd()
    }
  }

  function handleError(event: { data: number }) {
    console.error('[YouTubePlayer] error code:', event.data)
    player.setPlaying(false)
  }

  function handleAutoplayBlocked() {
    // Browser blocked scripted / autoplay playback (common on iOS/desktop).
    player.setBlocked()
  }

  // --- Internal helpers -----------------------------------------------------

  function _loadAndPlay(config: { videoId: string; startSeconds: number; endSeconds?: number }) {
    if (!ytPlayer) return
    // loadVideoById triggers autoplay on desktop; on iOS it may be blocked.
    ytPlayer.loadVideoById(config)
    startTimeTracking()
  }

  function onSongEnd() {
    const { nextSong } = usePlayback()
    nextSong()
  }

  function startTimeTracking() {
    stopTimeTracking()
    intervalId = setInterval(() => {
      if (!ytPlayer || !player.isPlaying) return
      const time = ytPlayer.getCurrentTime()
      player.updateTime(time)
      const song = player.currentSong
      if (song && song.end_at > 0 && time >= song.end_at) {
        onSongEnd()
      }
    }, 500)
  }

  function stopTimeTracking() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // --- Public API -----------------------------------------------------------

  /**
   * Primary play request — call this directly from a user-gesture handler
   * (click / tap) so that the synchronous call to loadVideoById() stays
   * within the iOS user-gesture chain.
   *
   * If the player is not yet ready, the request is queued and processed in
   * onReady().
   */
  function requestPlay(song: Song) {
    player.clearBlocked()
    const config = {
      videoId: song.video.id,
      startSeconds: song.start_at,
      endSeconds: song.end_at > 0 ? song.end_at : undefined,
    }
    if (!ready.value || !ytPlayer) {
      pendingRequest = config
      return
    }
    _loadAndPlay(config)
  }

  /** Resume the current video (e.g. from play/pause toggle). */
  function resumePlay() {
    if (!ytPlayer) return
    player.clearBlocked()
    ytPlayer.playVideo()
  }

  /** Pause the current video. */
  function pausePlay() {
    ytPlayer?.pauseVideo()
  }

  /**
   * Retry after autoplay was blocked.  Must be called from a user-gesture
   * handler so that the gesture chain is preserved.
   */
  function retryPlay() {
    const song = player.currentSong
    if (!song) return
    requestPlay(song)
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
    pendingRequest = null
  }

  // --- Passive watchers (volume / mute) -------------------------------------
  // These do not affect the user-gesture chain so watch-based is fine.

  watch(
    () => player.volume,
    (vol) => {
      ytPlayer?.setVolume(vol)
    },
  )

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
    requestPlay,
    resumePlay,
    pausePlay,
    retryPlay,
    seekTo,
    destroy,
  }
}
