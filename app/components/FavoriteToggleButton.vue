<template>
  <button
    class="p-1 transition-colors"
    :class="isFav ? 'text-selected-text' : 'text-gray-400 hover:text-white'"
    :aria-pressed="isFav"
    :title="isFav ? 'お気に入りから削除' : 'お気に入りに追加'"
    @click.stop="handleToggle"
  >
    <FontAwesomeIcon
      :icon="isFav ? ['fas', 'star'] : ['far', 'star']"
      :class="size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'"
    />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    songId: number
    songTitle: string
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' },
)

const playlistsStore = usePlaylistsStore()
const { toggleFavoriteSong } = usePlaylistActions()

const isFav = computed(() => playlistsStore.isFavorite(props.songId))

function handleToggle() {
  toggleFavoriteSong(props.songId, props.songTitle)
}
</script>
