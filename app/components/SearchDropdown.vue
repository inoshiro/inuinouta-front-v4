<template>
  <div
    class="fixed inset-x-0 top-14 z-30 max-h-[calc(100dvh-12rem)] overflow-y-auto overscroll-contain border-b border-border-default bg-surface-raised shadow-lg lg:absolute lg:inset-x-auto lg:left-0 lg:right-0 lg:top-full lg:mt-1 lg:max-h-none lg:overflow-visible lg:border"
    @mousedown.prevent
  >
    <!-- 楽曲候補 -->
    <div v-if="hasSongs">
      <div class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        楽曲
      </div>
      <div
        v-for="song in songs"
        :key="song.id"
        class="group flex w-full items-center gap-3 px-3 py-2 hover:bg-surface-overlay"
      >
        <!-- クリックで詳細遷移（アクションボタン以外の領域） -->
        <div
          class="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
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
        </div>
        <!-- アクションボタン -->
        <div class="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
          <button
            class="p-1.5 text-gray-400 hover:text-white"
            title="再生"
            @click.stop="handlePlaySong(song)"
          >
            <FontAwesomeIcon :icon="['fas', 'play']" class="h-3.5 w-3.5" />
          </button>
          <button
            class="p-1.5 text-gray-400 hover:text-white"
            title="次に再生"
            @click.stop="queueActions.playNext(song)"
          >
            <FontAwesomeIcon :icon="['fas', 'angles-right']" class="h-3.5 w-3.5" />
          </button>
          <button
            class="p-1.5 text-gray-400 hover:text-white"
            title="キューに追加"
            @click.stop="queueActions.addToQueue(song)"
          >
            <FontAwesomeIcon :icon="['fas', 'plus']" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
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

const queueActions = useQueueActions()

function handleSongClick(song: Song) {
  navigateTo(`/songs/${song.id}`)
  emit('close')
}

/** 再生ボタン: iOS user-gesture chain 内で player.play + requestPlay を同期呼び出し */
function handlePlaySong(song: Song) {
  queueActions.playSong(song)
  // Do not close: user may want to queue more songs after playing
}

function handleVideoClick(video: VideoList) {
  navigateTo(`/videos/${video.id}`)
  emit('close')
}
</script>
