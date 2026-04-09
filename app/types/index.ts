// --- Video ---

export interface VideoBasic {
  id: string // YouTube video ID (primary key)
  title: string
  url: string
  thumbnail_path: string
  is_open: boolean
  is_member_only: boolean
  is_stream: boolean
  unplayable: boolean
  published_at: string
}

export interface VideoList extends VideoBasic {
  songs_count: number
}

export interface VideoDetail extends VideoBasic {
  songs: SongBasic[]
}

// --- Song ---

export interface SongBasic {
  id: number
  title: string
  artist: string | null
  is_original: boolean
  start_at: number
  end_at: number
}

export interface Song extends SongBasic {
  video: VideoBasic
}

// --- Play History ---

export interface PlayEvent {
  songId: number
  playedAt: number // Unix timestamp (ms)
}

// --- Playlist (API) ---

export interface PlaylistItem {
  id: number
  order: number
  song: Song
}

export interface Playlist {
  id: number
  name: string
  description: string
  created_at: string
  items: PlaylistItem[]
}

// --- Playlist (Local-first / localStorage) ---

export interface LocalPlaylistItem {
  id: string // UUID
  song_id: number
  order: number
}

export interface LocalPlaylist {
  id: string // UUID
  name: string
  description: string
  items: LocalPlaylistItem[]
  created_at: string // ISO 8601
  updated_at: string // ISO 8601
}

// --- API Response Wrappers (dynamic-rest format) ---

export interface PaginationMeta {
  page: number
  per_page: number
  total_results: number
  total_pages: number
}

export interface SongsResponse {
  songs: Song[]
  meta?: PaginationMeta
}

export interface SongResponse {
  song: Song
}

export interface VideosResponse {
  videos: VideoList[]
  meta?: PaginationMeta
}

export interface VideoResponse {
  video: VideoDetail
}
