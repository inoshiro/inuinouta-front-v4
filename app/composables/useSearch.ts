export function useSearch() {
  const query = ref('')
  const route = useRoute()
  const router = useRouter()
  const { trackSearch } = useAnalytics()

  // Sync from URL on init
  if (route.query.q) {
    query.value = route.query.q as string
  }

  function search(value: string) {
    // Update the local ref only — the dropdown reads this directly.
    // URL is updated only on submit (Enter).
    query.value = value
  }

  function submit() {
    if (!query.value.trim()) return
    trackSearch(query.value, deriveSearchSource(route.path))
    router.push({ path: '/search', query: { q: query.value } })
  }

  function clear() {
    query.value = ''
  }

  return { query, search, clear, submit }
}

function deriveSearchSource(path: string): string {
  if (path === '/search') return 'search_page'
  if (path === '/songs') return 'songs_page'
  if (path === '/videos' || path.startsWith('/videos/')) return 'videos_page'
  return 'header'
}
