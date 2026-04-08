export function useSearch() {
  const query = ref('')
  const route = useRoute()
  const router = useRouter()

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
    router.push({ path: '/search', query: { q: query.value } })
  }

  function clear() {
    query.value = ''
  }

  return { query, search, clear, submit }
}
