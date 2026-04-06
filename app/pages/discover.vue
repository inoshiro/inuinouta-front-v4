<template>
  <div class="px-4 py-6">
    <h1 class="mb-6 text-xl font-bold text-gray-50">探索</h1>
    <ClientOnly>
      <DiscoverArtistBubble />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: '探索' })
</script>
