<template>
  <div>
    <h1 class="mb-6 text-xl font-bold text-gray-50">
      <template v-if="q">「{{ q }}」の検索結果</template>
      <template v-else>検索</template>
    </h1>

    <!-- Empty query guidance -->
    <div v-if="!q" class="text-gray-400">検索キーワードを入力してください。</div>

    <template v-else>
      <!-- Songs section -->
      <section class="mb-8">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-50">楽曲</h2>
          <NuxtLink
            v-if="songTotal > 0"
            :to="`/songs?q=${encodeURIComponent(q)}`"
            class="text-sm text-selected-text hover:underline"
          >
            楽曲をすべて見る（{{ songTotal }} 件）
          </NuxtLink>
        </div>

        <div
          v-if="songsStatus === 'pending'"
          class="divide-y divide-border-default border border-border-default"
        >
          <div v-for="n in 5" :key="n" class="h-14 animate-pulse bg-surface-raised" />
        </div>
        <div v-else-if="songResults.length === 0" class="py-12 text-center text-gray-400">
          楽曲が見つかりませんでした。
        </div>
        <div v-else class="border-t border-border-default">
          <SongListItem
            v-for="(song, i) in songResults"
            :key="song.id"
            :song="song"
            :index="i"
            :show-index="false"
          />
        </div>
      </section>

      <!-- Videos section -->
      <section>
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-50">動画</h2>
          <NuxtLink
            v-if="videoTotal > 0"
            :to="`/videos?q=${encodeURIComponent(q)}`"
            class="text-sm text-selected-text hover:underline"
          >
            動画をすべて見る（{{ videoTotal }} 件）
          </NuxtLink>
        </div>

        <div
          v-if="videosStatus === 'pending'"
          class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          <div v-for="n in 6" :key="n" class="border border-border-default bg-surface-raised">
            <div class="aspect-video animate-pulse bg-surface-overlay" />
            <div class="p-2 sm:p-3">
              <div class="h-3 animate-pulse bg-surface-overlay" />
              <div class="mt-1 h-2.5 w-1/2 animate-pulse bg-surface-overlay" />
            </div>
          </div>
        </div>
        <div v-else-if="videoResults.length === 0" class="py-12 text-center text-gray-400">
          動画が見つかりませんでした。
        </div>
        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <VideoCard v-for="video in videoResults" :key="video.id" :video="video" />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

const q = computed(() => {
  const val = route.query.q
  return typeof val === 'string' ? val : ''
})

const { songs: songResults, totalItems: songTotal, status: songsStatus } = useSongs({ perPage: 10 })
const {
  videos: videoResults,
  totalItems: videoTotal,
  status: videosStatus,
} = useVideos({
  perPage: 6,
})

useSeoMeta({
  title: computed(() => (q.value ? `「${q.value}」の検索結果` : '検索')),
  description: computed(() =>
    q.value ? `「${q.value}」に関連する楽曲・動画の検索結果です。` : '楽曲・動画を検索できます。',
  ),
})
</script>
