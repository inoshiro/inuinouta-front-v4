<template>
  <Teleport to="body">
    <Transition name="overlay-slide">
      <div
        v-if="overlay.isOpen.value"
        class="fixed inset-0 z-50 flex flex-col bg-surface-base text-gray-50 lg:hidden"
      >
        <!-- Header: full-row tap to close -->
        <div class="flex h-10 cursor-pointer items-center justify-center" @click="overlay.close()">
          <FontAwesomeIcon :icon="['fas', 'chevron-down']" class="h-6 w-6 text-gray-400" />
        </div>

        <!-- Video area spacer (actual player is CSS-positioned over this by YouTubeEmbed) -->
        <div class="aspect-video w-full bg-black" />

        <!-- Song info -->
        <div class="px-4 pt-3 pb-1">
          <!-- Title: marquee scroll when text overflows -->
          <div ref="titleContainerRef" class="overflow-hidden">
            <p
              ref="titleTextRef"
              class="whitespace-nowrap text-base font-medium"
              :class="titleScrollPx > 0 ? 'title-marquee' : 'truncate'"
              :style="titleScrollPx > 0 ? { '--scroll-dist': `-${titleScrollPx}px` } : {}"
            >
              {{ song.title }}
            </p>
          </div>
          <p class="text-xs text-gray-400">{{ song.artist ?? '不明' }}</p>
          <div ref="videoTitleContainerRef" class="mt-0.5 overflow-hidden">
            <p
              ref="videoTitleTextRef"
              class="whitespace-nowrap text-[10px] text-gray-600"
              :class="videoTitleScrollPx > 0 ? 'video-title-marquee' : 'truncate'"
              :style="videoTitleScrollPx > 0 ? { '--scroll-dist': `-${videoTitleScrollPx}px` } : {}"
            >
              {{ song.video.title }}
            </p>
          </div>
        </div>

        <!-- Seek bar with inline times -->
        <div class="px-4">
          <div class="flex items-center gap-3">
            <span class="w-9 shrink-0 text-right text-[11px] text-gray-400">{{
              formatTime(elapsed)
            }}</span>
            <div class="relative flex h-8 flex-1 cursor-pointer items-center" @click="handleSeek">
              <div class="relative h-1 w-full bg-gray-700">
                <div
                  class="absolute inset-y-0 left-0 bg-progress"
                  :style="{ width: progressPercent + '%' }"
                />
              </div>
              <!-- Seek thumb -->
              <div
                class="absolute top-1/2 h-4 w-4 -translate-y-1/2 bg-white"
                :style="{ left: `calc(${progressPercent}% - 8px)` }"
              />
            </div>
            <span class="w-9 shrink-0 text-[11px] text-gray-400">{{
              songDuration(song.start_at, song.end_at)
            }}</span>
          </div>
        </div>

        <!-- Playback controls -->
        <div class="flex items-center justify-center gap-6 py-3">
          <!-- Shuffle -->
          <button
            :class="queue.shuffleMode ? 'text-selected-text' : 'text-gray-400 hover:text-white'"
            @click="queue.toggleShuffle()"
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

          <!-- Play / Pause -->
          <button
            class="flex h-12 w-12 items-center justify-center bg-action-primary text-white hover:bg-action-primary-hover"
            :title="player.isBlocked ? '再生がブロックされました。タップして再試行' : undefined"
            @click="handlePlay"
          >
            <FontAwesomeIcon
              v-if="player.isBlocked"
              :icon="['fas', 'arrow-rotate-right']"
              class="h-6 w-6"
            />
            <template v-else>
              <FontAwesomeIcon v-if="player.isPlaying" :icon="['fas', 'pause']" class="h-6 w-6" />
              <FontAwesomeIcon v-else :icon="['fas', 'play']" class="h-6 w-6" />
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

        <!-- Sub-actions row -->
        <div class="flex items-center justify-around border-t border-border-default px-6 py-2">
          <!-- Add to playlist -->
          <button
            class="flex flex-col items-center gap-1 text-gray-400 hover:text-white"
            @click="showPlaylistSheet = true"
          >
            <FontAwesomeIcon :icon="['fas', 'bookmark']" class="h-5 w-5" />
            <span class="text-[10px]">保存</span>
          </button>

          <!-- Link to original video with timestamp -->
          <a
            :href="youtubeTimestampUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex flex-col items-center gap-1 text-gray-400 hover:text-white"
            title="元動画を開く（再生位置から）"
          >
            <FontAwesomeIcon :icon="['fas', 'arrow-up-right-from-square']" class="h-5 w-5" />
            <span class="text-[10px]">元動画</span>
          </a>

          <!-- Mute toggle -->
          <button
            class="flex flex-col items-center gap-1 hover:text-white"
            :class="player.isMuted ? 'text-selected-text' : 'text-gray-400'"
            title="ミュート"
            @click="player.toggleMute()"
          >
            <FontAwesomeIcon
              :icon="['fas', player.isMuted ? 'volume-xmark' : 'volume-high']"
              class="h-5 w-5"
            />
            <span class="text-[10px]">ミュート</span>
          </button>

          <!-- Share on X -->
          <a
            :href="xShareUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex flex-col items-center gap-1 text-gray-400 hover:text-white"
            title="Xでシェア"
          >
            <FontAwesomeIcon :icon="['fab', 'x-twitter']" class="h-5 w-5" />
            <span class="text-[10px]">シェア</span>
          </a>
        </div>

        <!-- Playlist sheet -->
        <AddToPlaylistSheet
          v-if="song"
          :open="showPlaylistSheet"
          :song-id="song.id"
          :song-title="song.title"
          @close="showPlaylistSheet = false"
        />

        <!-- Related songs (scrollable) -->
        <div class="flex-1 overflow-y-auto border-t border-border-default">
          <p class="px-4 pt-3 pb-2 text-xs font-medium text-gray-400">同じアーティストの曲</p>

          <SongListItem
            v-for="(s, i) in relatedSongs"
            :key="s.id"
            :song="s"
            :index="i"
            :show-index="false"
            :show-add-to-playlist="false"
          />

          <p v-if="relatedSongs.length === 0" class="px-4 py-6 text-center text-sm text-gray-500">
            関連する曲が見つかりませんでした
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const player = usePlayerStore()
const queue = useQueueStore()
const overlay = useMobileNowPlayingOverlay()
const playback = usePlayback()
const { formatTime, songDuration } = useFormatTime()
const { seekTo, retryPlay, requestPlay, loadedVideoId } = useYouTubePlayer()

const song = computed(() => player.currentSong!)
const showPlaylistSheet = ref(false)

const { relatedSongs } = useRelatedSongs(computed(() => player.currentSong))

// --- Progress ---
const progressPercent = computed(() => {
  const s = song.value
  if (!s) return 0
  const duration = s.end_at - s.start_at
  if (duration <= 0) return 0
  const el = player.currentTime - s.start_at
  return Math.min(100, Math.max(0, (el / duration) * 100))
})

const elapsed = computed(() => {
  const s = song.value
  if (!s) return 0
  return Math.max(0, player.currentTime - s.start_at)
})

// --- Seek ---
function handleSeek(e: MouseEvent) {
  const s = song.value
  if (!s) return
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  const duration = s.end_at - s.start_at
  seekTo(s.start_at + duration * percent)
}

// --- Play/Pause (user-gesture chain safe) ---
function handlePlay() {
  const s = player.currentSong
  if (player.isBlocked) {
    retryPlay()
  } else if (!player.isPlaying && s && (loadedVideoId.value !== s.video.id || player.isAtEnd)) {
    player.play(s)
    requestPlay(s)
  } else {
    playback.togglePlay()
  }
}

// --- YouTube timestamp URL ---
const youtubeTimestampUrl = computed(() => {
  const s = song.value
  if (!s) return '#'
  const t = Math.floor(player.currentTime)
  return `https://www.youtube.com/watch?v=${s.video.id}&t=${t}s`
})

// --- X share URL ---
const xShareUrl = computed(() => {
  const s = song.value
  if (!s) return '#'
  const text = encodeURIComponent(`${s.title}${s.artist ? ` / ${s.artist}` : ''}`)
  const url = encodeURIComponent(
    `https://www.youtube.com/watch?v=${s.video.id}&t=${Math.floor(s.start_at)}s`,
  )
  return `https://x.com/intent/tweet?text=${text}&url=${url}`
})

// --- Marquee scroll for long titles ---
const titleContainerRef = ref<HTMLElement | null>(null)
const titleTextRef = ref<HTMLElement | null>(null)
const titleScrollPx = ref(0)

watch(
  [() => overlay.isOpen.value, () => song.value?.title],
  async () => {
    titleScrollPx.value = 0
    if (!overlay.isOpen.value) return
    await nextTick()
    if (!titleTextRef.value || !titleContainerRef.value) return
    const overflow = titleTextRef.value.scrollWidth - titleContainerRef.value.clientWidth
    titleScrollPx.value = Math.max(0, overflow)
  },
  { immediate: true },
)

const videoTitleContainerRef = ref<HTMLElement | null>(null)
const videoTitleTextRef = ref<HTMLElement | null>(null)
const videoTitleScrollPx = ref(0)

watch(
  [() => overlay.isOpen.value, () => song.value?.video.title],
  async () => {
    videoTitleScrollPx.value = 0
    if (!overlay.isOpen.value) return
    await nextTick()
    if (!videoTitleTextRef.value || !videoTitleContainerRef.value) return
    const overflow = videoTitleTextRef.value.scrollWidth - videoTitleContainerRef.value.clientWidth
    videoTitleScrollPx.value = Math.max(0, overflow)
  },
  { immediate: true },
)

// --- Lock body scroll when overlay is open ---
watch(
  () => overlay.isOpen.value,
  (open) => {
    if (import.meta.client) {
      document.body.style.overflow = open ? 'hidden' : ''
    }
  },
)

// --- Close queue drawer if overlay opens ---
watch(
  () => overlay.isOpen.value,
  (open) => {
    if (open && queue.isOpen) {
      queue.toggleOpen()
    }
  },
)
</script>

<style scoped>
/* Marquee scroll: pause → slide to end → pause → snap back */
.title-marquee {
  animation: title-marquee 10s linear infinite;
}

.video-title-marquee {
  animation: title-marquee 12s linear infinite;
}

@keyframes title-marquee {
  0%,
  15% {
    transform: translateX(0);
  }
  70%,
  84% {
    transform: translateX(var(--scroll-dist));
  }
  85% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(0);
  }
}

.overlay-slide-enter-active,
.overlay-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}
.overlay-slide-enter-from,
.overlay-slide-leave-to {
  transform: translateY(100%);
}
</style>
