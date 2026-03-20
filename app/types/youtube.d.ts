declare namespace YT {
  interface PlayerOptions {
    height?: string | number
    width?: string | number
    videoId?: string
    playerVars?: Record<string, unknown>
    events?: {
      onReady?: (event: { target: Player }) => void
      onStateChange?: (event: OnStateChangeEvent) => void
      onError?: (event: { data: number }) => void
    }
  }

  interface OnStateChangeEvent {
    data: number
    target: Player
  }

  const PlayerState: {
    UNSTARTED: -1
    ENDED: 0
    PLAYING: 1
    PAUSED: 2
    BUFFERING: 3
    CUED: 5
  }

  class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions)
    loadVideoById(config: { videoId: string; startSeconds?: number; endSeconds?: number }): void
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
    setVolume(volume: number): void
    getVolume(): number
    mute(): void
    unMute(): void
    isMuted(): boolean
    getCurrentTime(): number
    getDuration(): number
    getPlayerState(): number
    destroy(): void
  }
}

interface Window {
  YT: typeof YT
  onYouTubeIframeAPIReady: () => void
}
