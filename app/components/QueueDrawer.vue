<template>
  <!-- Desktop: inline right panel, always in DOM, width-based open/close (lg+) -->
  <div
    class="hidden lg:flex flex-col overflow-hidden bg-surface-base transition-[width] duration-200"
    :class="queue.isOpen ? 'w-72 border-l border-border-default' : 'w-0'"
  >
    <!-- Fixed-width inner container, clipped by outer during transition -->
    <div class="flex w-72 flex-1 flex-col">
      <!-- Panel header -->
      <div
        class="shrink-0 flex items-center justify-between border-b border-border-default px-4 py-3"
      >
        <div class="flex items-center gap-2">
          <h2 class="text-sm font-bold text-gray-50">再生キュー</h2>
          <span v-if="queue.songs.length > 0" class="text-xs text-gray-400">
            {{ queue.songs.length }}曲 &middot; {{ queue.totalDuration }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button class="text-xs text-gray-400 hover:text-white" @click="queue.clear()">
            クリア
          </button>
          <button class="text-gray-400 hover:text-white" @click="queue.toggleOpen()">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Queue list -->
      <div class="flex-1 overflow-y-auto">
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
              class="flex w-full items-center gap-2 px-2 py-2 transition-colors hover:bg-surface-overlay"
              :class="index === queue.currentIndex ? 'bg-surface-overlay' : ''"
            >
              <!-- Drag handle -->
              <div
                class="drag-handle flex shrink-0 cursor-grab items-center justify-center active:cursor-grabbing text-gray-600 hover:text-gray-400"
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
              </div>

              <!-- Index / playing icon -->
              <span
                class="w-5 shrink-0 text-center text-xs"
                :class="index === queue.currentIndex ? 'text-emerald-400' : 'text-gray-500'"
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

              <!-- Song info -->
              <button class="min-w-0 flex-1 text-left" @click="jumpTo(index)">
                <p
                  class="truncate text-sm"
                  :class="
                    index === queue.currentIndex ? 'font-medium text-emerald-400' : 'text-gray-50'
                  "
                >
                  {{ song.title }}
                </p>
                <p class="truncate text-xs text-gray-500">{{ song.artist }}</p>
              </button>

              <!-- Remove -->
              <button
                class="shrink-0 text-gray-600 hover:text-white"
                @click="queue.removeSong(index)"
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
    </div>
  </div>

  <!-- Mobile: Teleport overlay (hidden on lg+ via lg:hidden) -->
  <Teleport to="body">
    <Transition name="slide">
      <div
        v-if="queue.isOpen"
        class="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-border-default bg-surface-base shadow-xl lg:hidden"
      >
        <!-- Panel header -->
        <div class="flex items-center justify-between border-b border-border-default px-4 py-3">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-gray-50">再生キュー</h2>
            <span v-if="queue.songs.length > 0" class="text-xs text-gray-400">
              {{ queue.songs.length }}曲 &middot; {{ queue.totalDuration }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button class="text-xs text-gray-400 hover:text-white" @click="queue.clear()">
              クリア
            </button>
            <button class="text-gray-400 hover:text-white" @click="queue.toggleOpen()">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Queue list -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="queue.songs.length === 0" class="px-4 py-8 text-center text-sm text-gray-500">
            キューに曲がありません
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
                class="flex w-full items-center gap-2 px-2 py-2 transition-colors hover:bg-surface-overlay"
                :class="index === queue.currentIndex ? 'bg-surface-overlay' : ''"
              >
                <!-- Drag handle -->
                <div
                  class="drag-handle flex shrink-0 cursor-grab items-center justify-center active:cursor-grabbing text-gray-600 hover:text-gray-400"
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
                </div>

                <!-- Index / playing icon -->
                <span
                  class="w-5 shrink-0 text-center text-xs"
                  :class="index === queue.currentIndex ? 'text-emerald-400' : 'text-gray-500'"
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

                <!-- Song info -->
                <button class="min-w-0 flex-1 text-left" @click="jumpTo(index)">
                  <p
                    class="truncate text-sm"
                    :class="
                      index === queue.currentIndex ? 'font-medium text-emerald-400' : 'text-gray-50'
                    "
                  >
                    {{ song.title }}
                  </p>
                  <p class="truncate text-xs text-gray-500">{{ song.artist }}</p>
                </button>

                <!-- Remove -->
                <button
                  class="shrink-0 text-gray-600 hover:text-white"
                  @click="queue.removeSong(index)"
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
      </div>
    </Transition>

    <!-- Backdrop (mobile only) -->
    <Transition name="fade">
      <div
        v-if="queue.isOpen"
        class="fixed inset-0 z-40 bg-black/40 lg:hidden"
        @click="queue.toggleOpen()"
      />
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { VueDraggableNext } from 'vue-draggable-next'
import type { Song } from '~/types'

const queue = useQueueStore()
const player = usePlayerStore()

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

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
