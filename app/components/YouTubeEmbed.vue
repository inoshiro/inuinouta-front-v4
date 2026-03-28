<template>
  <!--
    Positioned off-screen rather than display:none / 0×0.
    display:none prevents the browser from rendering the iframe at all, which
    can interfere with iOS WKWebView media playback.  1px off-screen keeps the
    element in the layout without being visible.
  -->
  <div
    style="position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px; overflow: hidden"
  >
    <div id="yt-player" />
  </div>
</template>

<script setup lang="ts">
const { initPlayer, destroy } = useYouTubePlayer()

onMounted(() => {
  initPlayer('yt-player')
})

onBeforeUnmount(() => {
  destroy()
})
</script>
