import type { LocalPlaylist, Song } from '~/types'

export type QueueAction = 'play_single' | 'play_all' | 'next' | 'append' | 'bulk'
export type PlaylistAction =
  | 'create'
  | 'add_song'
  | 'add_songs'
  | 'rename'
  | 'remove_song'
  | 'delete'
export type YouTubeClickSource = 'video_detail' | 'mobile_overlay'

export function useAnalytics() {
  const { gtag } = useGtag()

  function trackPlaySong(song: Song) {
    gtag('event', 'play_song', {
      song_id: song.id,
      song_title: song.title,
    })
  }

  function trackAddToQueue(song: Song, action: QueueAction) {
    gtag('event', 'add_to_queue', {
      song_id: song.id,
      song_title: song.title,
      action,
      count: 1,
    })
  }

  function trackAddAllToQueue(count: number, action: QueueAction) {
    gtag('event', 'add_to_queue', {
      action,
      count,
    })
  }

  function trackSearch(query: string, source: string) {
    gtag('event', 'search', {
      query,
      source,
    })
  }

  function trackFilterApply(filterType: string, filterValue: string) {
    gtag('event', 'filter_apply', {
      filter_type: filterType,
      filter_value: filterValue,
    })
  }

  function trackPlaylistAction(
    action: PlaylistAction,
    playlist: Pick<LocalPlaylist, 'id' | 'name'>,
    extra?: { song_id?: number; count?: number },
  ) {
    gtag('event', 'playlist_action', {
      action,
      playlist_id: playlist.id,
      playlist_name: playlist.name,
      ...extra,
    })
  }

  function trackYouTubeClick(source: YouTubeClickSource, videoId: string, songId?: number) {
    gtag('event', 'youtube_click', {
      source,
      video_id: videoId,
      ...(songId !== undefined ? { song_id: songId } : {}),
    })
  }

  return {
    trackPlaySong,
    trackAddToQueue,
    trackAddAllToQueue,
    trackSearch,
    trackFilterApply,
    trackPlaylistAction,
    trackYouTubeClick,
  }
}
