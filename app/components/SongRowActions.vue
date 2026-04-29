<template>
  <div class="flex shrink-0 items-center gap-2">
    <!-- Favorite button: always visible for favorites, hover-only for non-favorites -->
    <FavoriteToggleButton
      :song-id="song.id"
      :song-title="song.title"
      size="sm"
      class="transition-opacity"
      :class="isFavoriteSong ? '' : 'sm:opacity-0 sm:group-hover:opacity-100'"
    />
    <div
      class="flex shrink-0 gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:[&:has(.dropdown-open)]:opacity-100"
    >
      <AddToPlaylistDropdown :song-id="song.id" :song-title="song.title" />
      <button
        class="p-1 text-gray-400 hover:text-white"
        title="次に再生"
        @click.stop="queueActions.playNext(song)"
      >
        <FontAwesomeIcon :icon="['fas', 'angles-right']" class="h-4 w-4" />
      </button>
      <button
        class="p-1 text-gray-400 hover:text-white"
        title="キューに追加"
        @click.stop="queueActions.addToQueue(song)"
      >
        <FontAwesomeIcon :icon="['fas', 'plus']" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Song } from '~/types'

const props = defineProps<{
  song: Song
}>()

const playlistsStore = usePlaylistsStore()
const queueActions = useQueueActions()

const isFavoriteSong = computed(() => playlistsStore.isFavorite(props.song.id))
</script>
