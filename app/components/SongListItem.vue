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
      :class="isActive ? 'text-emerald-400' : 'text-gray-500'"
    >
      <svg
        v-if="isActive && player.isPlaying"
        class="mx-auto h-3.5 w-3.5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M3 22V2l7 4v12l-7 4zm8 0V6l7 4v8l-7 4zm8 0V10l5 3v6l-5 3z" />
      </svg>
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
        class="absolute inset-0 flex items-center justify-center bg-black/40"
      >
        <svg class="h-3.5 w-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 22V2l7 4v12l-7 4zm8 0V6l7 4v8l-7 4zm8 0V10l5 3v6l-5 3z" />
        </svg>
      </div>
    </div>

    <!-- Song info -->
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm" :class="isActive ? 'font-medium text-emerald-400' : ''">
        {{ song.title }}
      </p>
      <p class="truncate text-xs text-gray-500">{{ song.artist ?? '不明' }}</p>
    </div>

    <!-- Duration -->
    <span class="shrink-0 text-xs text-gray-500">
      {{ songDuration(song.start_at, song.end_at) }}
    </span>

    <!-- Actions -->
    <div
      class="flex shrink-0 gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:[&:has(.dropdown-open)]:opacity-100"
    >
      <slot name="extra-actions" />
      <AddToPlaylistDropdown v-if="showAddToPlaylist" :song-id="song.id" :song-title="song.title" />
      <button
        class="p-1 text-gray-400 hover:text-white"
        title="次に再生"
        @click.stop="queueActions.playNext(song)"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
          />
        </svg>
      </button>
      <button
        class="p-1 text-gray-400 hover:text-white"
        title="キューに追加"
        @click.stop="queueActions.addToQueue(song)"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
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
