<template>
  <div v-if="status === 'pending'" class="space-y-4">
    <div class="h-8 w-64 animate-pulse bg-surface-raised" />
    <div class="aspect-video max-w-lg animate-pulse bg-surface-raised" />
  </div>

  <div v-else-if="video" class="space-y-6">
    <!-- Video header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
      <img
        :src="video.thumbnail_path"
        :alt="video.title"
        class="aspect-video w-full max-w-lg object-cover"
      />
      <div class="flex-1">
        <h1 class="text-xl font-bold lg:text-2xl">{{ video.title }}</h1>
        <p class="mt-2 text-sm text-gray-500">
          {{
            new Date(video.published_at).toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          }}
        </p>
        <p class="mt-1 text-sm text-gray-400">{{ video.songs.length }}曲</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-if="video.songs.length > 0"
            class="bg-action-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-action-primary-hover"
            @click="playVideoSongs"
          >
            すべて再生
          </button>
          <a
            :href="video.url"
            target="_blank"
            rel="noopener noreferrer"
            class="border border-border-default px-5 py-2 text-sm text-gray-300 transition-colors hover:bg-surface-overlay hover:text-white"
          >
            YouTubeで見る
            <FontAwesomeIcon :icon="['fas', 'arrow-up-right-from-square']" class="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </div>

    <!-- Song list -->
    <section v-if="video.songs.length > 0">
      <h2 class="mb-3 text-sm font-bold text-gray-400">収録楽曲</h2>
      <div
        v-for="(s, index) in video.songs"
        :key="s.id"
        class="group flex cursor-pointer items-center gap-3 border-b border-border-default px-3 py-2 transition-colors hover:bg-surface-overlay"
        @click="playSongFromVideo(index)"
      >
        <span class="w-8 text-center text-xs text-gray-500">{{ index + 1 }}</span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{{ s.title }}</p>
          <p class="truncate text-xs text-gray-500">{{ s.artist ?? '不明' }}</p>
        </div>
        <span class="shrink-0 text-xs text-gray-500">
          {{ songDuration(s.start_at, s.end_at) }}
        </span>
      </div>
    </section>
  </div>

  <div v-else class="text-center text-gray-500">動画が見つかりませんでした</div>
</template>

<script setup lang="ts">
import type { Song } from '~/types'

const route = useRoute()
const videoId = route.params.id as string

const { video, status } = useVideo(videoId)
const queueActions = useQueueActions()
const { songDuration } = useFormatTime()

useHead({
  title: computed(() => (video.value ? `${video.value.title} | inuinouta` : 'inuinouta')),
})

/** Convert video's SongBasic[] to Song[] by injecting the video reference */
function toSongs(): Song[] {
  if (!video.value) return []
  const v = video.value
  return v.songs.map((s) => ({
    ...s,
    video: {
      id: v.id,
      title: v.title,
      url: v.url,
      thumbnail_path: v.thumbnail_path,
      is_open: v.is_open,
      is_member_only: v.is_member_only,
      is_stream: v.is_stream,
      unplayable: v.unplayable,
      published_at: v.published_at,
    },
  }))
}

function playVideoSongs() {
  queueActions.playAll(toSongs())
}

function playSongFromVideo(index: number) {
  queueActions.playAll(toSongs(), index)
}
</script>
