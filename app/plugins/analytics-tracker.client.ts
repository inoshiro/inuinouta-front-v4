// Tracks play_song events by watching loadedVideoId (module-level singleton in useYouTubePlayer).
// Fires when a new video is loaded — covers both manual plays and autoplay (next song).
// page_view is handled automatically by nuxt-gtag via GA4 Enhanced Measurement.
export default defineNuxtPlugin(() => {
  const { loadedVideoId } = useYouTubePlayer()
  const queue = useQueueStore()
  const { trackPlaySong } = useAnalytics()

  watch(loadedVideoId, (newId) => {
    if (!newId) return
    const song = queue.currentSong
    if (!song) return
    trackPlaySong(song)
  })
})
