<template>
  <div v-if="status === 'pending'" class="space-y-4">
    <div class="h-8 w-48 animate-pulse bg-surface-raised" />
    <div class="aspect-video max-w-md animate-pulse bg-surface-raised" />
  </div>

  <div v-else-if="song" class="space-y-6">
    <!-- Song header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      <img
        :src="song.video.thumbnail_path"
        :alt="song.title"
        class="aspect-video w-full max-w-sm object-cover sm:w-60"
      />
      <div class="flex-1">
        <h1 class="text-2xl font-bold">{{ song.title }}</h1>
        <p class="mt-1 text-gray-400">{{ song.artist ?? '不明' }}</p>
        <p class="mt-2 text-sm text-gray-500">
          {{ songDuration(song.start_at, song.end_at) }}
        </p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            class="bg-emerald-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-400"
            @click="queueActions.playSong(song)"
          >
            再生
          </button>
          <button
            class="border border-border-default px-5 py-2 text-sm text-gray-300 transition-colors hover:bg-surface-overlay hover:text-white"
            @click="queueActions.playNext(song)"
          >
            次に再生
          </button>
          <button
            class="border border-border-default px-5 py-2 text-sm text-gray-300 transition-colors hover:bg-surface-overlay hover:text-white"
            @click="queueActions.addToQueue(song)"
          >
            キューに追加
          </button>
        </div>
      </div>
    </div>

    <!-- Video info -->
    <section class="border-t border-border-default pt-4">
      <h2 class="mb-2 text-sm font-bold text-gray-400">収録動画</h2>
      <NuxtLink
        :to="`/videos/${song.video.id}`"
        class="block border border-border-default bg-surface-raised p-3 transition-colors hover:border-emerald-500/40"
      >
        <p class="text-sm font-medium">{{ song.video.title }}</p>
        <p class="mt-1 text-xs text-gray-500">
          {{ new Date(song.video.published_at).toLocaleDateString('ja-JP') }}
        </p>
      </NuxtLink>
    </section>
  </div>

  <div v-else class="text-center text-gray-500">楽曲が見つかりませんでした</div>
</template>

<script setup lang="ts">
const route = useRoute()
const songId = route.params.id as string

const { song, status } = useSong(songId)
const queueActions = useQueueActions()
const { songDuration } = useFormatTime()

useHead({
  title: computed(() => (song.value ? `${song.value.title} | inuinouta` : 'inuinouta')),
})
</script>
