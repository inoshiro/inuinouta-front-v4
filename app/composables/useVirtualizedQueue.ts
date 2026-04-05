import type { Song } from '~/types'

const CHUNK_SIZE = 50

export function useVirtualizedQueue(getSongs: () => Song[]) {
  const visibleCount = ref(CHUNK_SIZE)
  const visibleSongs = computed<Song[]>(() => getSongs().slice(0, visibleCount.value))
  const hasMore = computed(() => visibleCount.value < getSongs().length)

  function loadMore() {
    if (hasMore.value) {
      visibleCount.value = Math.min(visibleCount.value + CHUNK_SIZE, getSongs().length)
    }
  }

  // Reset when the songs array is replaced (play-all / clear).
  // Shallow watch: does not fire for individual push/splice mutations.
  watch(getSongs, () => {
    visibleCount.value = CHUNK_SIZE
  })

  return { visibleSongs, hasMore, loadMore }
}
