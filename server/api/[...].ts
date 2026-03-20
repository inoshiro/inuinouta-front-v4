export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const target = config.apiBaseUrl as string

  // event.path is like /api/songs/?per_page=2
  // Strip the leading /api/ to get the Django API path
  const path = event.path.replace(/^\/api\//, '')
  const url = `${target}/${path}`

  return proxyRequest(event, url)
})
