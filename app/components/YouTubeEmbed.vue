<template>
  <!--
    Single YouTube player host.
    The player DOM never moves — only CSS changes.
    When the mobile overlay is open the container is positioned over
    the overlay's video area (z-51, below overlay header).
    When the desktop layer is open (lg+) it covers the center column only
    (mounted inside that column's `relative` container in default.vue), so
    the sidebar, queue and PlayerBar stay outside it and remain operable.
    When closed it sits off-screen (iOS-safe: 1×1px, not display:none).
  -->
  <div :class="containerClass">
    <!-- Desktop layer chrome: song title + hide button, stacked above the video (not overlapping it) -->
    <div
      v-if="showDesktopFull"
      class="flex shrink-0 items-center justify-between gap-2 bg-surface-overlay px-4 py-2"
    >
      <p class="min-w-0 truncate text-sm font-medium text-gray-50">
        {{ player.currentSong?.title }}
      </p>
      <button
        type="button"
        class="shrink-0 p-1.5 text-gray-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-selected-border"
        aria-label="動画を隠す"
        title="動画を隠す"
        @click="desktopPanel.close()"
      >
        <FontAwesomeIcon :icon="['fas', 'xmark']" class="h-5 w-5" />
      </button>
    </div>

    <!-- Stable iframe host: native YouTube controls remain operable in every mode. -->
    <div :class="showDesktopFull ? 'min-h-0 w-full flex-1' : 'h-full w-full'">
      <div id="yt-player" class="h-full w-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { initPlayer, setQuality, destroy } = useYouTubePlayer()
const overlay = useMobileNowPlayingOverlay()
const desktopPanel = useDesktopPlayerPanel()
const player = usePlayerStore()

const showDesktopFull = computed(() => desktopPanel.isOpen.value && !!player.currentSong)

const containerClass = computed(() => {
  if (overlay.isOpen.value) return 'player-overlay'
  if (showDesktopFull.value) return 'player-desktop-full'
  return 'player-offscreen'
})

// Switch quality based on visibility: save bandwidth when player is off-screen
watch(
  () => overlay.isOpen.value || showDesktopFull.value,
  (visible) => {
    setQuality(visible ? 'hd720' : 'tiny')
  },
)

onMounted(() => {
  initPlayer('yt-player')
})

onBeforeUnmount(() => {
  destroy()
})
</script>

<style scoped>
/* Off-screen: keeps DOM alive for iOS autoplay compliance */
.player-offscreen {
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* Overlay mode: positioned over MobileNowPlayingOverlay's video area */
.player-overlay {
  position: fixed;
  top: 48px; /* h-12 header */
  left: 0;
  width: 100vw;
  aspect-ratio: 16 / 9;
  z-index: 51; /* above overlay z-50 */
}

/* Desktop full layer: fills the center column (its mount point is that
   column's `relative` container), covering header + page content only.
   Flex column so the title bar sits above the video instead of overlapping it. */
.player-desktop-full {
  position: absolute;
  inset: 0;
  z-index: 20;
  background-color: black;
  display: flex;
  flex-direction: column;
}
</style>
