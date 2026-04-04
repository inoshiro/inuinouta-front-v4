<template>
  <!-- Panel header -->
  <div class="shrink-0 flex items-center justify-between border-b border-border-default px-4 py-3">
    <div class="flex items-center gap-2">
      <h2 class="text-sm font-bold text-gray-50">再生キュー</h2>
      <span v-if="queue.songs.length > 0" class="text-xs text-gray-400">
        {{ queue.songs.length }}曲 &middot; {{ queue.totalDuration }}
      </span>
    </div>
    <div class="flex items-center gap-2">
      <button
        v-if="queue.songs.length > 0"
        class="text-xs text-gray-400 hover:text-white"
        @click="isSaving = true"
      >
        保存
      </button>
      <button class="text-xs text-gray-400 hover:text-white" @click="playback.clearQueue()">
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
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 8h16M4 16h16"
              />
            </svg>
            <span
              class="w-5 text-center text-xs"
              :class="index === queue.currentIndex ? 'text-selected-text' : 'text-gray-500'"
            >
              <svg
                v-if="index === queue.currentIndex && player.isPlaying"
                class="mx-auto h-3 w-3"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 22V2l7 4v12l-7 4zm8 0V6l7 4v8l-7 4zm8 0V10l5 3v6l-5 3z" />
              </svg>
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
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </VueDraggableNext>
    </ClientOnly>
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
const draggableQueue = ref<Song[]>([])

watch(
  () => queue.songs,
  (newSongs) => {
    draggableQueue.value = [...newSongs]
  },
  { immediate: true, deep: true },
)

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
