<template>
  <div
    v-if="player.currentSong"
    class="border-t bg-surface-raised transition-[border-color] duration-300 ease-in-out"
    :class="player.isPlaying ? 'border-playing-glow-muted/30' : 'border-border-default'"
  >
    <!-- Mobile: compact player -->
    <div class="lg:hidden">
      <div class="flex items-center gap-3 px-3 py-2">
        <!-- Tappable song info area: opens mobile now-playing overlay -->
        <div
          class="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
          @click="mobileOverlay.open()"
        >
          <img
            :src="player.currentSong.video.thumbnail_path"
            :alt="player.currentSong.title"
            class="h-10 w-10 object-cover"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium">{{ player.currentSong.title }}</p>
            <p class="truncate text-xs text-gray-400">{{ player.currentSong.artist }}</p>
          </div>
        </div>
        <button
          class="text-gray-400 hover:text-white disabled:opacity-30"
          :disabled="!queue.hasPrevious"
          @click="playback.previousSong()"
        >
          <FontAwesomeIcon :icon="['fas', 'backward-step']" class="h-5 w-5" />
        </button>
        <button
          class="flex h-8 w-8 items-center justify-center bg-action-primary text-white hover:bg-action-primary-hover"
          :title="player.isBlocked ? '再生がブロックされました。タップして再試行' : undefined"
          @click="handleMobilePlay"
        >
          <!-- Blocked: show retry icon -->
          <FontAwesomeIcon
            v-if="player.isBlocked"
            :icon="['fas', 'arrow-rotate-right']"
            class="h-5 w-5"
          />
          <template v-else>
            <FontAwesomeIcon v-if="player.isPlaying" :icon="['fas', 'pause']" class="h-5 w-5" />
            <FontAwesomeIcon v-else :icon="['fas', 'play']" class="h-5 w-5" />
          </template>
        </button>
        <button
          class="text-gray-400 hover:text-white disabled:opacity-30"
          :disabled="!queue.hasNext"
          @click="playback.nextSong()"
        >
          <FontAwesomeIcon :icon="['fas', 'forward-step']" class="h-5 w-5" />
        </button>

        <!-- Queue toggle -->
        <div class="relative flex items-center">
          <button
            class="p-1"
            :class="queue.isOpen ? 'text-selected-text' : 'text-gray-400 hover:text-white'"
            @click="queue.toggleOpen()"
          >
            <FontAwesomeIcon :icon="['fas', 'bars']" class="h-5 w-5" />
          </button>
          <span
            v-if="queue.songs.length > 0"
            class="pointer-events-none absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center bg-emphasis px-1 text-[10px] font-bold leading-none text-white"
          >
            {{ queue.songs.length > 99 ? '99+' : queue.songs.length }}
          </span>
        </div>
      </div>
      <!-- Mobile progress bar -->
      <div class="relative h-0.5 w-full bg-gray-700">
        <div
          class="absolute inset-y-0 left-0 bg-progress"
          :style="{ width: progressPercent + '%' }"
        />
      </div>
    </div>

    <!-- Desktop: full player -->
    <div class="hidden items-center gap-4 px-6 py-3 lg:flex">
      <!-- Song info -->
      <div class="flex min-w-0 items-center gap-3" style="width: 240px">
        <img
          :src="player.currentSong.video.thumbnail_path"
          :alt="player.currentSong.title"
          class="h-12 w-12 shrink-0 object-cover transition-shadow duration-500 ease-out"
          :style="player.isPlaying ? 'box-shadow: 0 0 8px var(--color-playing-glow)' : ''"
        />
        <div class="min-w-0">
          <NuxtLink
            :to="`/songs/${player.currentSong.id}`"
            class="block truncate text-sm font-medium hover:text-selected-text"
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
            class="text-gray-400 hover:text-white disabled:opacity-30"
            :disabled="queue.songs.length <= 1"
            @click="handleShuffle()"
          >
            <FontAwesomeIcon :icon="['fas', 'shuffle']" class="h-4 w-4" />
          </button>

          <!-- Previous -->
          <button
            class="text-gray-400 hover:text-white disabled:opacity-30"
            :disabled="!queue.hasPrevious"
            @click="playback.previousSong()"
          >
            <FontAwesomeIcon :icon="['fas', 'backward-step']" class="h-5 w-5" />
          </button>

          <!-- Play/Pause -->
          <button
            class="flex h-9 w-9 items-center justify-center bg-action-primary text-white hover:bg-action-primary-hover"
            :title="player.isBlocked ? '再生がブロックされました。タップして再試行' : undefined"
            @click="handleDesktopPlay"
          >
            <!-- Blocked: show retry icon -->
            <FontAwesomeIcon
              v-if="player.isBlocked"
              :icon="['fas', 'arrow-rotate-right']"
              class="h-5 w-5"
            />
            <template v-else>
              <FontAwesomeIcon v-if="player.isPlaying" :icon="['fas', 'pause']" class="h-5 w-5" />
              <FontAwesomeIcon v-else :icon="['fas', 'play']" class="h-5 w-5" />
            </template>
          </button>

          <!-- Next -->
          <button
            class="text-gray-400 hover:text-white disabled:opacity-30"
            :disabled="!queue.hasNext"
            @click="playback.nextSong()"
          >
            <FontAwesomeIcon :icon="['fas', 'forward-step']" class="h-5 w-5" />
          </button>

          <!-- Repeat -->
          <button
            class="relative"
            :class="
              queue.repeatMode !== 'off' ? 'text-selected-text' : 'text-gray-400 hover:text-white'
            "
            @click="queue.cycleRepeatMode()"
          >
            <FontAwesomeIcon :icon="['fas', 'repeat']" class="h-4 w-4" />
            <span
              v-if="queue.repeatMode === 'one'"
              class="absolute -top-1 -right-1 text-[10px] font-bold"
            >
              1
            </span>
          </button>
        </div>

        <!-- Progress bar -->
        <div class="flex w-full max-w-lg items-center gap-2 text-xs text-gray-400">
          <span>{{
            formatTime(Math.max(0, player.currentTime - player.currentSong.start_at))
          }}</span>
          <div
            class="group/bar relative h-1 flex-1 cursor-pointer bg-gray-700 transition-all hover:h-1.5"
            @click="handleSeek"
          >
            <div
              class="absolute inset-y-0 left-0 bg-progress transition-shadow duration-300"
              :style="{
                width: progressPercent + '%',
                boxShadow: player.isPlaying ? '0 0 6px var(--color-playing-glow)' : 'none',
              }"
            />
          </div>
          <span>{{ songDuration(player.currentSong.start_at, player.currentSong.end_at) }}</span>
        </div>
      </div>

      <!-- Right controls: volume + queue -->
      <div class="flex items-center gap-3" style="width: 200px; justify-content: flex-end">
        <!-- Volume -->
        <button class="text-gray-400 hover:text-white" @click="player.toggleMute()">
          <FontAwesomeIcon
            v-if="player.isMuted || player.volume === 0"
            :icon="['fas', 'volume-xmark']"
            class="h-5 w-5"
          />
          <FontAwesomeIcon v-else :icon="['fas', 'volume-high']" class="h-5 w-5" />
        </button>
        <input
          type="range"
          min="0"
          max="100"
          :value="player.volume"
          class="h-1 w-20 cursor-pointer accent-action-primary"
          @input="player.setVolume(Number(($event.target as HTMLInputElement).value))"
        />

        <!-- Queue toggle -->
        <div class="relative">
          <button
            :class="queue.isOpen ? 'text-selected-text' : 'text-gray-400 hover:text-white'"
            @click="queue.toggleOpen()"
          >
            <FontAwesomeIcon :icon="['fas', 'bars']" class="h-5 w-5" />
          </button>
          <span
            v-if="queue.songs.length > 0"
            class="pointer-events-none absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center bg-emphasis px-1 text-[10px] font-bold leading-none text-white"
          >
            {{ queue.songs.length > 99 ? '99+' : queue.songs.length }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const player = usePlayerStore()
const queue = useQueueStore()
const playback = usePlayback()
const { success } = useNotifications()

function handleShuffle() {
  queue.shuffleQueue()
  success('キューをシャッフルしました')
}
const { formatTime, songDuration } = useFormatTime()
const { seekTo, retryPlay, requestPlay, loadedVideoId } = useYouTubePlayer()
const mobileOverlay = useMobileNowPlayingOverlay()

const progressPercent = computed(() => {
  const song = player.currentSong
  if (!song) return 0
  const duration = song.end_at - song.start_at
  if (duration <= 0) return 0
  const elapsed = player.currentTime - song.start_at
  return Math.min(100, Math.max(0, (elapsed / duration) * 100))
})

/**
 * Handle play button from a user gesture.
 * If the current song has not been loaded into the iframe yet (e.g. restored from
 * LocalStorage after a page reload), call requestPlay() so the video is loaded first.
 * This also keeps us within the iOS user-gesture chain for scripted playback.
 */
function handlePlay() {
  const song = player.currentSong
  if (player.isBlocked) {
    retryPlay()
  } else if (
    !player.isPlaying &&
    song &&
    (loadedVideoId.value !== song.video.id || player.isAtEnd)
  ) {
    // Video not yet loaded in the iframe, or playback ended naturally —
    // must use requestPlay to (re)load from start_at.
    player.play(song)
    requestPlay(song)
  } else {
    playback.togglePlay()
  }
}

function handleMobilePlay() {
  handlePlay()
}

function handleDesktopPlay() {
  handlePlay()
}

function handleSeek(e: MouseEvent) {
  const song = player.currentSong
  if (!song) return
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const duration = song.end_at - song.start_at
  const seekTime = song.start_at + duration * percent
  seekTo(seekTime)
}
</script>
