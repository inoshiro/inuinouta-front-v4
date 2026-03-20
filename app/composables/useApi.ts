import type { NitroFetchOptions } from 'nitropack'
import type { UseFetchOptions } from 'nuxt/app'

export function useApi() {
  async function $api<T>(path: string, options?: NitroFetchOptions<string>) {
    return $fetch<T>(path, {
      ...options,
    })
  }

  function useApiFetch<T>(
    path: string | Ref<string> | (() => string),
    options?: UseFetchOptions<T>,
  ) {
    return useFetch<T>(path, {
      ...options,
    })
  }

  return {
    $api,
    useApiFetch,
  }
}
