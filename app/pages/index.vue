<template>
  <div class="space-y-10">
    <!-- Random picks -->
    <section>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-bold">ピックアップ</h2>
        <div class="flex items-center gap-3">
          <button
            class="text-sm text-gray-400 transition-colors hover:text-selected-text"
            :disabled="!randomSongs.length"
            @click="addAllToQueue(randomSongs, 'ランダムピックアップ')"
          >
            キューに追加
          </button>
          <button
            class="text-sm text-gray-400 transition-colors hover:text-selected-text"
            @click="randomRefresh()"
          >
            シャッフル
          </button>
        </div>
      </div>
      <div
        v-if="randomStatus === 'pending'"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        <div v-for="n in 10" :key="n" class="aspect-video animate-pulse bg-surface-raised" />
      </div>
      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <SongCard v-for="song in randomSongs" :key="song.id" :song="song" />
      </div>
    </section>

    <!-- Recent songs -->
    <section>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-bold">最新の楽曲</h2>
        <div class="flex items-center gap-3">
          <button
            class="text-sm text-gray-400 transition-colors hover:text-selected-text"
            :disabled="!recentSongs.length"
            @click="addAllToQueue(recentSongs, '最新の楽曲')"
          >
            キューに追加
          </button>
          <NuxtLink
            to="/songs"
            class="text-sm text-gray-400 transition-colors hover:text-selected-text"
          >
            すべて見る →
          </NuxtLink>
        </div>
      </div>
      <div
        v-if="recentStatus === 'pending'"
        class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        <div v-for="n in 10" :key="n" class="aspect-video animate-pulse bg-surface-raised" />
      </div>
      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <SongCard v-for="song in recentSongs" :key="song.id" :song="song" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Song, SongsResponse } from '~/types'

useHead({ title: 'inuinouta' })

const queue = useQueueStore()
const notify = useNotifications()

function addAllToQueue(songs: Song[], label: string) {
  for (const song of songs) {
    queue.addSong(song)
  }
  queue.isOpen = true
  notify.success(`${label}の${songs.length}曲をキューに追加しました`)
}

const { songs: randomSongs, status: randomStatus, refresh: randomRefresh } = useRandomSongs(10)

const { useApiFetch } = useApi()
const { data: recentResponse, status: recentStatus } = await useApiFetch<SongsResponse>(
  '/api/songs/',
  {
    query: { page: 1, per_page: 10, 'sort[]': '-video.published_at' },
  },
)
const recentSongs = computed(() => recentResponse.value?.songs ?? [])
</script>
