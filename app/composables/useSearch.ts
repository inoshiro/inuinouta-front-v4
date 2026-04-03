export function useSearch() {
  const query = ref('')
  const route = useRoute()
  const router = useRouter()

  // Sync from URL on init
  if (route.query.q) {
    query.value = route.query.q as string
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function search(value: string) {
    query.value = value
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      router.replace({ query: { ...route.query, q: value || undefined } })
    }, 300)
  }

  function submit() {
    if (!query.value.trim()) return
    router.push({ path: '/search', query: { q: query.value } })
  }

  function clear() {
    query.value = ''
    router.replace({ query: { ...route.query, q: undefined } })
  }

  function submit() {
    if (!query.value.trim()) return
    router.push({ path: '/search', query: { q: query.value } })
  }

  return { query, search, clear, submit }
}
