<template>
  <div class="space-y-10">
    <!-- Random picks -->
    <section>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-bold">ピックアップ</h2>
        <button
          class="text-sm text-gray-400 transition-colors hover:text-emerald-400"
          @click="randomRefresh()"
        >
          シャッフル
        </button>
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
        <NuxtLink
          to="/songs"
          class="text-sm text-gray-400 transition-colors hover:text-emerald-400"
        >
          すべて見る →
        </NuxtLink>
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
useHead({ title: 'inuinouta' })

const { songs: randomSongs, status: randomStatus, refresh: randomRefresh } = useRandomSongs(10)

const { songs: recentSongs, status: recentStatus } = useSongs({ perPage: 10 })
</script>
