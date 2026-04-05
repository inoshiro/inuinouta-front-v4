<template>
  <!--
    Single YouTube player host.
    The player DOM never moves — only CSS changes.
    When the mobile overlay is open the container is positioned over
    the overlay's video area (z-51, below overlay header).
    When closed it sits off-screen (iOS-safe: 1×1px, not display:none).
  -->
  <div :class="overlay.isOpen.value ? 'player-overlay' : 'player-offscreen'">
    <div id="yt-player" class="h-full w-full" />
  </div>
</template>

<script setup lang="ts">
const { initPlayer, setQuality, destroy } = useYouTubePlayer()
const overlay = useMobileNowPlayingOverlay()

// Switch quality based on visibility: save bandwidth when player is off-screen
watch(
  () => overlay.isOpen.value,
  (open) => {
    setQuality(open ? 'hd720' : 'tiny')
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
</style>
