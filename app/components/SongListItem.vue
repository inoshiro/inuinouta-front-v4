<template>
  <div
    class="group flex cursor-pointer items-center gap-3 border-b border-border-default px-3 py-2 transition-colors hover:bg-surface-overlay"
    :class="isActive ? 'bg-surface-overlay' : ''"
    @click="queueActions.playSong(song)"
  >
    <!-- Play indicator / index: only rendered when showIndex=true (e.g. playlists with ordering) -->
    <span
      v-if="showIndex"
      class="w-8 shrink-0 text-center text-xs"
      :class="isActive ? 'text-selected-text' : 'text-gray-500'"
    >
      <FontAwesomeIcon
        v-if="isActive && player.isPlaying"
        :icon="['fas', 'volume-high']"
        class="mx-auto h-3.5 w-3.5"
      />
      <template v-else>{{ index + 1 }}</template>
    </span>

    <!-- Thumbnail: always visible including mobile.
         When showIndex=false, this is the leftmost element.
         Play overlay shown on thumbnail when active and playing (only when showIndex=false). -->
    <div class="relative shrink-0">
      <img
        :src="song.video.thumbnail_path"
        :alt="song.title"
        class="h-10 object-cover"
        style="aspect-ratio: 16/9"
        loading="lazy"
      />
      <div
        v-if="!showIndex && isActive && player.isPlaying"
        class="absolute inset-0 flex items-center justify-center bg-black/60"
      >
        <FontAwesomeIcon :icon="['fas', 'volume-high']" class="h-4 w-4 text-selected-text" />
      </div>
    </div>

    <!-- Song info -->
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm" :class="isActive ? 'font-medium text-selected-text' : ''">
        {{ song.title }}
      </p>
      <p class="truncate text-xs text-gray-500">{{ song.artist ?? '不明' }}</p>
    </div>

    <!-- Duration (hidden on mobile to give more room for song title) -->
    <span class="hidden shrink-0 text-xs text-gray-500 sm:inline">
      {{ songDuration(song.start_at, song.end_at) }}
    </span>

    <!-- Actions -->
    <div
      class="flex shrink-0 gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:[&:has(.dropdown-open)]:opacity-100"
    >
      <slot name="extra-actions" />
      <AddToPlaylistDropdown v-if="showAddToPlaylist" :song-id="song.id" :song-title="song.title" />
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

const props = withDefaults(
  defineProps<{
    song: Song
    index: number
    showIndex?: boolean
    showAddToPlaylist?: boolean
  }>(),
  { showIndex: true, showAddToPlaylist: true },
)

const player = usePlayerStore()
const queueActions = useQueueActions()
const { songDuration } = useFormatTime()

const isActive = computed(() => player.currentSong?.id === props.song.id)
</script>
