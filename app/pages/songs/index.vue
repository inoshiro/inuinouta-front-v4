<template>
  <div>
    <!-- Header row -->
    <div class="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl font-bold text-gray-50">楽曲一覧</h1>
      <button
        v-if="songs.length > 0"
        class="self-start bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-400"
        @click="queueActions.playAll(songs)"
      >
        すべて再生
      </button>
    </div>

    <!-- Filter bar -->
    <div class="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <!-- Song type toggle -->
      <div class="flex">
        <button
          v-for="t in songTypeOptions"
          :key="t.value"
          class="relative -ml-px border border-border-default px-3 py-1.5 text-sm transition-colors first:ml-0"
          :class="
            songType === t.value
              ? 'z-10 border-emerald-500 bg-emerald-500/10 text-emerald-400'
              : 'text-gray-400 hover:text-gray-50'
          "
          @click="songType = t.value"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Video type toggle -->
      <div class="flex">
        <button
          v-for="t in videoTypeOptions"
          :key="t.value"
          class="relative -ml-px border border-border-default px-3 py-1.5 text-sm transition-colors first:ml-0"
          :class="
            videoType === t.value
              ? 'z-10 border-emerald-500 bg-emerald-500/10 text-emerald-400'
              : 'text-gray-400 hover:text-gray-50'
          "
          @click="videoType = t.value"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Artist filter button -->
      <button
        class="border px-3 py-1.5 text-sm transition-colors"
        :class="
          selectedArtist
            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
            : 'border-border-default text-gray-400 hover:text-gray-50'
        "
        @click="artistModalOpen = true"
      >
        {{ selectedArtist || '全アーティスト' }} ▼
      </button>
    </div>

    <!-- Artist cloud modal -->
    <ArtistCloudModal
      :is-open="artistModalOpen"
      :selected-artist="selectedArtist"
      :artists="artistsWithCount"
      @close="artistModalOpen = false"
      @select="onSelectArtist"
    />

    <!-- Result count -->
    <p class="mb-4 text-sm text-gray-400">{{ totalItems }} 曲見つかりました</p>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="space-y-2">
      <div v-for="n in 10" :key="n" class="h-14 animate-pulse bg-surface-raised" />
    </div>

    <template v-else>
      <!-- Empty state -->
      <div v-if="songs.length === 0" class="py-12 text-center text-gray-400">
        楽曲が見つかりませんでした
      </div>

      <!-- Song list -->
      <div v-else>
        <SongListItem
          v-for="(song, index) in songs"
          :key="song.id"
          :song="song"
          :index="index"
          :show-index="false"
        />
      </div>
    </template>

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
import type { SongTypeFilter, VideoTypeFilter } from '~/composables/useSongs'

useHead({ title: '楽曲一覧 | inuinouta' })

const {
  songs,
  totalItems,
  page,
  perPage,
  songType,
  videoType,
  selectedArtist,
  artistsWithCount,
  selectArtist,
  status,
} = useSongs({ perPage: 50 })
const queueActions = useQueueActions()

const artistModalOpen = ref(false)

function onSelectArtist(name: string) {
  selectArtist(name)
  artistModalOpen.value = false
}

const songTypeOptions: { value: SongTypeFilter; label: string }[] = [
  { value: '', label: 'すべて' },
  { value: 'original', label: 'オリジナル' },
  { value: 'cover', label: 'カバー' },
]

const videoTypeOptions: { value: VideoTypeFilter; label: string }[] = [
  { value: '', label: 'すべて' },
  { value: 'music_video', label: '歌動画' },
  { value: 'stream', label: '歌配信' },
]
</script>
