<template>
  <NuxtLink
    :to="`/videos/${video.id}`"
    class="group block border border-border-default bg-surface-raised transition-colors hover:border-action-primary/40"
  >
    <!-- Thumbnail -->
    <div class="relative aspect-video overflow-hidden">
      <img
        :src="video.thumbnail_path"
        :alt="video.title"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div
        class="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40"
      >
        <svg
          class="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <!-- Song count badge -->
      <span class="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 text-xs text-gray-200">
        {{ video.songs_count }}曲
      </span>
    </div>

    <!-- Info -->
    <div class="p-2 sm:p-3">
      <p class="line-clamp-2 text-xs font-medium sm:text-sm" :title="video.title">
        {{ video.title }}
      </p>
      <p class="mt-0.5 text-xs text-gray-500 sm:mt-1">
        {{ formatDate(video.published_at) }}
      </p>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { VideoList } from '~/types'

defineProps<{ video: VideoList }>()

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
