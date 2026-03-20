import type { SongsResponse } from '~/types'

export function useRandomSongs(count: number = 10) {
  const { useApiFetch } = useApi()

  const {
    data: raw,
    status,
    error,
    refresh,
  } = useApiFetch<SongsResponse>(`/api/random/?per_page=${count}`)

  const songs = computed(() => raw.value?.songs ?? [])

  return { songs, status, error, refresh }
}
