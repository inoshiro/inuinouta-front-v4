<template>
  <div>
    <h1 class="mb-6 text-xl font-bold">動画一覧</h1>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 9" :key="n" class="aspect-video animate-pulse bg-surface-raised" />
    </div>

    <!-- Video grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <VideoCard v-for="video in videos" :key="video.id" :video="video" />
    </div>

    <!-- Pagination -->
    <div class="mt-6">
      <AppPagination
        :total-items="totalItems"
        :items-per-page="perPage"
        :current-page="page"
        @update:page="page = $event"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: '動画一覧 | inuinouta' })

const { videos, totalItems, page, perPage, status } = useVideos({ perPage: 30 })
</script>
