<template>
  <Teleport to="body">
    <Transition name="slide">
      <div
        v-if="queue.isOpen"
        class="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-border-default bg-surface-base shadow-xl"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-border-default px-4 py-3">
          <h2 class="text-sm font-bold">再生キュー</h2>
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
          <div v-else>
            <button
              v-for="(song, index) in queue.songs"
              :key="`${song.id}-${index}`"
              class="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-surface-overlay"
              :class="index === queue.currentIndex ? 'bg-surface-overlay' : ''"
              @click="jumpTo(index)"
            >
              <span
                class="w-5 text-center text-xs"
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
              <div class="min-w-0 flex-1">
                <p
                  class="truncate text-sm"
                  :class="index === queue.currentIndex ? 'text-emerald-400 font-medium' : ''"
                >
                  {{ song.title }}
                </p>
                <p class="truncate text-xs text-gray-500">{{ song.artist }}</p>
              </div>
              <button
                class="shrink-0 text-gray-600 hover:text-white"
                @click.stop="queue.removeSong(index)"
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
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <Transition name="fade">
      <div v-if="queue.isOpen" class="fixed inset-0 z-40 bg-black/40" @click="queue.toggleOpen()" />
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const queue = useQueueStore()
const player = usePlayerStore()

function jumpTo(index: number) {
  queue.currentIndex = index
  const song = queue.currentSong
  if (song) player.play(song)
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
