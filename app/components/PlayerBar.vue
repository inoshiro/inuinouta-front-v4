<template>
  <div v-if="player.currentSong" class="border-t border-border-default bg-surface-raised">
    <!-- Mobile: compact player -->
    <div class="flex items-center gap-3 px-3 py-2 lg:hidden">
      <img
        :src="player.currentSong.video.thumbnail_path"
        :alt="player.currentSong.title"
        class="h-10 w-10 object-cover"
      />
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium">{{ player.currentSong.title }}</p>
        <p class="truncate text-xs text-gray-400">{{ player.currentSong.artist }}</p>
      </div>
      <button class="text-gray-400 hover:text-white" @click="playback.togglePlay()">
        <svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
          <path v-if="player.isPlaying" d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          <path v-else d="M8 5v14l11-7z" />
        </svg>
      </button>
    </div>

    <!-- Desktop: full player -->
    <div class="hidden items-center gap-4 px-6 py-3 lg:flex">
      <!-- Song info -->
      <div class="flex min-w-0 items-center gap-3" style="width: 240px">
        <img
          :src="player.currentSong.video.thumbnail_path"
          :alt="player.currentSong.title"
          class="h-12 w-12 shrink-0 object-cover"
        />
        <div class="min-w-0">
          <NuxtLink
            :to="`/songs/${player.currentSong.id}`"
            class="block truncate text-sm font-medium hover:text-emerald-400"
          >
            {{ player.currentSong.title }}
          </NuxtLink>
          <p class="truncate text-xs text-gray-400">{{ player.currentSong.artist }}</p>
        </div>
      </div>

      <!-- Playback controls -->
      <div class="flex flex-1 flex-col items-center gap-1">
        <div class="flex items-center gap-4">
          <!-- Shuffle -->
          <button
            :class="queue.shuffleMode ? 'text-emerald-400' : 'text-gray-400 hover:text-white'"
            @click="queue.toggleShuffle()"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4h4l3 9 3-9h4M4 20h4l3-9 3 9h4"
              />
            </svg>
          </button>

          <!-- Previous -->
          <button
            class="text-gray-400 hover:text-white disabled:opacity-30"
            :disabled="!queue.hasPrevious"
            @click="playback.previousSong()"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
            </svg>
          </button>

          <!-- Play/Pause -->
          <button
            class="flex h-9 w-9 items-center justify-center bg-white text-black hover:bg-gray-200"
            @click="playback.togglePlay()"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path v-if="player.isPlaying" d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              <path v-else d="M8 5v14l11-7z" />
            </svg>
          </button>

          <!-- Next -->
          <button
            class="text-gray-400 hover:text-white disabled:opacity-30"
            :disabled="!queue.hasNext"
            @click="playback.nextSong()"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 6h2v12h-2V6zm-3.5 6L4 6v12l8.5-6z" />
            </svg>
          </button>

          <!-- Repeat -->
          <button
            :class="
              queue.repeatMode !== 'off' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'
            "
            @click="queue.cycleRepeatMode()"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h5M20 20v-5h-5"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.49 9A9 9 0 005.64 5.64L4 4m16 16l-1.64-1.64A9 9 0 013.51 15"
              />
            </svg>
            <span
              v-if="queue.repeatMode === 'one'"
              class="absolute -top-1 -right-1 text-[8px] font-bold"
            >
              1
            </span>
          </button>
        </div>

        <!-- Progress bar -->
        <div class="flex w-full max-w-lg items-center gap-2 text-xs text-gray-400">
          <span>{{ formatTime(player.currentTime) }}</span>
          <div class="relative h-1 flex-1 cursor-pointer bg-gray-700" @click="handleSeek">
            <div
              class="absolute inset-y-0 left-0 bg-emerald-500"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
          <span>{{ songDuration(player.currentSong.start_at, player.currentSong.end_at) }}</span>
        </div>
      </div>

      <!-- Right controls: volume + queue -->
      <div class="flex items-center gap-3" style="width: 200px; justify-content: flex-end">
        <!-- Volume -->
        <button class="text-gray-400 hover:text-white" @click="player.toggleMute()">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              v-if="player.isMuted || player.volume === 0"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5.586v12.828a1 1 0 01-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5.586v12.828a1 1 0 01-1.707.707L5.586 15z"
            />
          </svg>
        </button>
        <input
          type="range"
          min="0"
          max="100"
          :value="player.volume"
          class="h-1 w-20 cursor-pointer accent-emerald-500"
          @input="player.setVolume(Number(($event.target as HTMLInputElement).value))"
        />

        <!-- Queue toggle -->
        <button
          :class="queue.isOpen ? 'text-emerald-400' : 'text-gray-400 hover:text-white'"
          @click="queue.toggleOpen()"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 10h16M4 14h10"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const player = usePlayerStore()
const queue = useQueueStore()
const playback = usePlayback()
const { formatTime, songDuration } = useFormatTime()

const progressPercent = computed(() => {
  const song = player.currentSong
  if (!song) return 0
  const duration = song.end_at - song.start_at
  if (duration <= 0) return 0
  const elapsed = player.currentTime - song.start_at
  return Math.min(100, Math.max(0, (elapsed / duration) * 100))
})

function handleSeek(e: MouseEvent) {
  const song = player.currentSong
  if (!song) return
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const duration = song.end_at - song.start_at
  const seekTime = song.start_at + duration * percent
  const { seekTo } = useYouTubePlayer()
  seekTo(seekTime)
}
</script>
