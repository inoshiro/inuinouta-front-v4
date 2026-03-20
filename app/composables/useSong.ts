import type { SongResponse, Song } from '~/types'

export function useSong(id: Ref<string | number> | string | number) {
  const { useApiFetch } = useApi()
  const path = computed(() => `/api/songs/${unref(id)}/`)

  const { data: raw, status, error } = useApiFetch<SongResponse>(path)

  const song = computed<Song | null>(() => raw.value?.song ?? null)

  return { song, status, error }
}
