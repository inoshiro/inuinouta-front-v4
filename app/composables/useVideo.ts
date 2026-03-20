import type { VideoResponse, VideoDetail } from '~/types'

export function useVideo(id: Ref<string> | string) {
  const { useApiFetch } = useApi()
  const path = computed(() => `/api/videos/${unref(id)}/`)

  const { data: raw, status, error } = useApiFetch<VideoResponse>(path)

  const video = computed<VideoDetail | null>(() => raw.value?.video ?? null)

  return { video, status, error }
}
