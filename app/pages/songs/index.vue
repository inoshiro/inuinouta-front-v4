<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl font-bold">楽曲一覧</h1>
      <button
        v-if="songs.length > 0"
        class="self-start bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-400"
        @click="queueActions.playAll(songs)"
      >
        すべて再生
      </button>
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="space-y-2">
      <div v-for="n in 10" :key="n" class="h-14 animate-pulse bg-surface-raised" />
    </div>

    <!-- Song list -->
    <div v-else>
      <SongListItem v-for="(song, index) in songs" :key="song.id" :song="song" :index="index" />
    </div>

    <!-- Pagination -->
    <div class="mt-6">
      <AppPagination :meta="meta" @update:page="page = $event" />
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '楽曲一覧 | inuinouta' })

const { songs, meta, page, status } = useSongs({ perPage: 50 })
const queueActions = useQueueActions()
</script>
