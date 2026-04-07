<template>
  <div
    class="fixed inset-x-0 top-14 z-30 border-b border-border-default bg-surface-raised shadow-lg lg:absolute lg:inset-x-auto lg:left-0 lg:right-0 lg:top-full lg:mt-1 lg:border"
  >
    <!-- 楽曲候補 -->
    <div v-if="hasSongs">
      <div class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        楽曲
      </div>
      <button
        v-for="song in songs"
        :key="song.id"
        class="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-overlay"
        @click="handleSongClick(song)"
      >
        <img
          :src="song.video.thumbnail_path"
          :alt="song.title"
          class="h-8 shrink-0 object-cover"
          style="aspect-ratio: 16/9"
        />
        <div class="min-w-0">
          <div class="truncate text-sm text-gray-50">{{ song.title }}</div>
          <div v-if="song.artist" class="truncate text-xs text-gray-400">{{ song.artist }}</div>
        </div>
      </button>
    </div>

    <!-- 動画候補 -->
    <div v-if="hasVideos" :class="hasSongs ? 'border-t border-border-default' : ''">
      <div class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        動画
      </div>
      <button
        v-for="video in videos"
        :key="video.id"
        class="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-overlay"
        @click="handleVideoClick(video)"
      >
        <img
          :src="video.thumbnail_path"
          :alt="video.title"
          class="h-8 shrink-0 object-cover"
          style="aspect-ratio: 16/9"
        />
        <div class="min-w-0">
          <div class="truncate text-sm text-gray-50">{{ video.title }}</div>
        </div>
      </button>
    </div>

    <!-- 0件 -->
    <div v-if="isEmpty" class="px-3 py-4 text-sm text-gray-400">見つかりませんでした。</div>

    <!-- フッター: すべての結果を見る -->
    <div class="border-t border-border-default">
      <NuxtLink
        :to="`/search?q=${encodeURIComponent(query)}`"
        class="flex w-full items-center justify-center px-3 py-2 text-sm text-selected-text hover:bg-surface-overlay"
        @click="$emit('close')"
      >
        「{{ query }}」のすべての結果を見る
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Song, VideoList } from '~/types'

defineProps<{
  songs: Song[]
  videos: VideoList[]
  hasSongs: boolean
  hasVideos: boolean
  isEmpty: boolean
  query: string
}>()

const emit = defineEmits<{
  close: []
}>()

function handleSongClick(song: Song) {
  navigateTo(`/songs/${song.id}`)
  emit('close')
}

function handleVideoClick(video: VideoList) {
  navigateTo(`/videos/${video.id}`)
  emit('close')
}
</script>
