import type { Song, VideoList, SongsResponse, VideosResponse } from '~/types'

type FetchStatus = 'idle' | 'pending' | 'ready' | 'error'

export const useLibraryStore = defineStore('library', () => {
  const { $api } = useApi()

  // --- Songs ---
  const allSongs = ref<Song[]>([])
  const songsStatus = ref<FetchStatus>('idle')
  const songsError = ref<Error | null>(null)

  async function fetchSongs(force = false) {
    if (!force && songsStatus.value === 'ready') return
    songsStatus.value = 'pending'
    songsError.value = null
    try {
      const songs: Song[] = []
      let page = 1
      let totalPages = 1
      while (page <= totalPages) {
        const params = new URLSearchParams()
        params.set('per_page', '200')
        params.set('page', String(page))
        params.set('sort[]', '-video.published_at')
        const res = await $api<SongsResponse>(`/api/songs/?${params.toString()}`)
        songs.push(...res.songs)
        if (res.meta) {
          totalPages = res.meta.total_pages
        }
        page++
      }
      allSongs.value = songs
      songsStatus.value = 'ready'
    } catch (e) {
      songsError.value = e instanceof Error ? e : new Error(String(e))
      songsStatus.value = 'error'
    }
  }

  // --- Videos ---
  const allVideos = ref<VideoList[]>([])
  const videosStatus = ref<FetchStatus>('idle')
  const videosError = ref<Error | null>(null)

  async function fetchVideos(force = false) {
    if (!force && videosStatus.value === 'ready') return
    videosStatus.value = 'pending'
    videosError.value = null
    try {
      const videos: VideoList[] = []
      let page = 1
      let totalPages = 1
      while (page <= totalPages) {
        const params = new URLSearchParams()
        params.set('per_page', '200')
        params.set('page', String(page))
        const res = await $api<VideosResponse>(`/api/videos/?${params.toString()}`)
        videos.push(...res.videos)
        if (res.meta) {
          totalPages = res.meta.total_pages
        }
        page++
      }
      allVideos.value = videos
      videosStatus.value = 'ready'
    } catch (e) {
      videosError.value = e instanceof Error ? e : new Error(String(e))
      videosStatus.value = 'error'
    }
  }

  return {
    allSongs,
    songsStatus,
    songsError,
    fetchSongs,
    allVideos,
    videosStatus,
    videosError,
    fetchVideos,
  }
})
