<template>
  <div
    class="group cursor-pointer border border-border-default bg-surface-raised transition-colors hover:border-emerald-500/40"
    @click="queueActions.playSong(song)"
  >
    <!-- Thumbnail -->
    <div class="relative aspect-video overflow-hidden">
      <img
        :src="song.video.thumbnail_path"
        :alt="song.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div
        class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40"
      >
        <svg
          class="h-10 w-10 text-white opacity-0 transition-opacity group-hover:opacity-100"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <!-- Duration badge -->
      <span class="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 text-xs text-gray-200">
        {{ songDuration(song.start_at, song.end_at) }}
      </span>
    </div>

    <!-- Info -->
    <div class="p-3">
      <p class="truncate text-sm font-medium" :title="song.title">{{ song.title }}</p>
      <p class="mt-0.5 truncate text-xs text-gray-400">{{ song.artist ?? '不明' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Song } from '~/types'

defineProps<{ song: Song }>()
const queueActions = useQueueActions()
const { songDuration } = useFormatTime()
</script>
