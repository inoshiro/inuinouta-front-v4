<template>
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
</template>

<script setup lang="ts">
import type { Song } from '~/types'

defineProps<{
  song: Song
}>()

const queueActions = useQueueActions()
</script>
