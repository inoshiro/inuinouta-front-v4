import type { SongsResponse } from '~/types'

export function useSongs(options?: { perPage?: number }) {
  const { useApiFetch } = useApi()
  const page = ref(1)
  const perPage = options?.perPage ?? 30
  const search = ref('')

  const query = computed(() => {
    const params = new URLSearchParams()
    params.set('per_page', String(perPage))
    params.set('page', String(page.value))
    if (search.value) {
      params.set('filter{title.icontains}', search.value)
    }
    return `/api/songs/?${params.toString()}`
  })

  const { data: raw, status, error, refresh } = useApiFetch<SongsResponse>(query)

  const songs = computed(() => raw.value?.songs ?? [])
  const meta = computed(() => raw.value?.meta)

  return { songs, meta, page, search, status, error, refresh }
}
