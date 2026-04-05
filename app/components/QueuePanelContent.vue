<template>
  <!-- Panel header -->
  <div class="shrink-0 flex items-center justify-between border-b border-border-default px-4 py-3">
    <span v-if="queue.songs.length > 0" class="text-xs text-gray-400">
      {{ queue.songs.length }}曲 &middot; {{ queue.totalDuration }}
    </span>
    <span v-else class="text-xs text-gray-500">キューは空です</span>
    <div class="flex items-center gap-2">
      <button
        v-if="queue.songs.length > 0"
        class="bg-action-primary px-3 py-1 text-xs text-white hover:bg-action-primary-hover"
        @click="isSaving = true"
      >
        保存
      </button>
      <button
        class="border border-border-default px-3 py-1 text-xs text-gray-300 hover:text-white"
        @click="playback.clearQueue()"
      >
        クリア
      </button>
    </div>
  </div>

  <!-- Save as playlist panel -->
  <QueueSavePanel v-if="isSaving" @close="isSaving = false" />

  <!-- Queue list -->
  <div class="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
    <div v-if="queue.songs.length === 0" class="px-4 py-8 text-center text-sm text-gray-400">
      キューに曲がありません
      <p class="mt-1 text-xs text-gray-500">楽曲ページから曲を追加してみましょう</p>
    </div>
    <ClientOnly v-else>
      <VueDraggableNext
        v-model="draggableQueue"
        handle=".drag-handle"
        animation="150"
        @end="handleDragEnd"
      >
        <div
          v-for="(song, index) in draggableQueue"
          :key="`${song.id}-${index}`"
          class="flex w-full items-center gap-2 border-l-2 px-2 py-2 transition-colors hover:bg-surface-overlay"
          :class="
            index === queue.currentIndex
              ? 'border-l-playing-glow-muted bg-surface-overlay'
              : 'border-l-transparent'
          "
        >
          <!-- Drag handle + index / playing icon -->
          <div
            class="drag-handle flex self-stretch shrink-0 cursor-grab items-center gap-1 active:cursor-grabbing text-gray-600 hover:text-gray-400"
            title="ドラッグで並び替え"
          >
            <FontAwesomeIcon :icon="['fas', 'grip-vertical']" class="h-4 w-4" />
            <span
              class="w-5 text-center text-xs"
              :class="index === queue.currentIndex ? 'text-selected-text' : 'text-gray-500'"
            >
              <FontAwesomeIcon
                v-if="index === queue.currentIndex && player.isPlaying"
                :icon="['fas', 'volume-high']"
                class="mx-auto h-3 w-3"
              />
              <template v-else>{{ index + 1 }}</template>
            </span>
          </div>

          <!-- Song info -->
          <button class="min-w-0 flex-1 text-left" @click="jumpTo(index)">
            <p
              class="truncate text-sm"
              :class="
                index === queue.currentIndex ? 'font-medium text-selected-text' : 'text-gray-50'
              "
            >
              {{ song.title }}
            </p>
            <p class="truncate text-xs text-gray-500">{{ song.artist }}</p>
          </button>

          <!-- Remove -->
          <button
            class="shrink-0 text-gray-600 hover:text-white"
            @click="playback.removeSongFromQueue(index)"
          >
            <FontAwesomeIcon :icon="['fas', 'xmark']" class="h-4 w-4" />
          </button>
        </div>
      </VueDraggableNext>
    </ClientOnly>
    <!-- Sentinel for lazy-load: becomes visible when user scrolls near bottom -->
    <div v-if="hasMore" ref="sentinelEl" class="h-4" aria-hidden="true" />
  </div>

  <!-- Footer: close button -->
  <div class="shrink-0 border-t border-border-default px-4 py-3">
    <button
      class="w-full text-center text-xs text-gray-400 hover:text-white"
      @click="queue.toggleOpen()"
    >
      キューを閉じる
    </button>
  </div>
</template>

<script setup lang="ts">
import { VueDraggableNext } from 'vue-draggable-next'
import type { Song } from '~/types'

const queue = useQueueStore()
const player = usePlayerStore()
const playback = usePlayback()

const isSaving = ref(false)

const { visibleSongs, hasMore, loadMore } = useVirtualizedQueue(() => queue.songs)

const draggableQueue = ref<Song[]>([])

watch(
  visibleSongs,
  (newSongs) => {
    draggableQueue.value = [...newSongs]
  },
  { immediate: true },
)

// IntersectionObserver to trigger loadMore when sentinel scrolls into view
const sentinelEl = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) loadMore()
    },
    { threshold: 0 },
  )
  if (sentinelEl.value) observer.observe(sentinelEl.value)
})

watch(sentinelEl, (el, prevEl) => {
  if (prevEl) observer?.unobserve(prevEl)
  if (el) observer?.observe(el)
})

onUnmounted(() => {
  observer?.disconnect()
  observer = null
})

function handleDragEnd(event: { oldIndex: number; newIndex: number }) {
  queue.moveSong(event.oldIndex, event.newIndex)
}

function jumpTo(index: number) {
  queue.currentIndex = index
  const song = queue.currentSong
  if (!song) return
  player.play(song)
  const { requestPlay } = useYouTubePlayer()
  requestPlay(song)
}
</script>
