import type { VideosResponse } from '~/types'

export function useVideos(options?: { perPage?: number }) {
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
    return `/api/videos/?${params.toString()}`
  })

  const { data: raw, status, error, refresh } = useApiFetch<VideosResponse>(query)

  const videos = computed(() => raw.value?.videos ?? [])
  const meta = computed(() => raw.value?.meta)

  return { videos, meta, page, search, status, error, refresh }
}
