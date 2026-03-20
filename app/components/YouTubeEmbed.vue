<template>
  <div class="hidden">
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
