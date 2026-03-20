import type { NitroFetchOptions } from 'nitropack'

export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBaseUrl as string

  async function $api<T>(path: string, options?: NitroFetchOptions<string>) {
    return $fetch<T>(path, {
      baseURL,
      ...options,
    })
  }

  function useApiFetch<T>(path: string | Ref<string> | (() => string), options?: object) {
    return useFetch<T>(path, {
      baseURL,
      ...options,
    })
  }

  return {
    $api,
    useApiFetch,
  }
}
