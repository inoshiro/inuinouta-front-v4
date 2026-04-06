<script setup lang="ts">
useSeoMeta({ title: '探索' })
</script>

<template>
  <div class="min-h-screen bg-surface-base">
    <div class="p-4">
      <h1 class="text-gray-50 text-lg font-medium mb-4">楽曲を探索</h1>
    </div>
    <ClientOnly>
      <DiscoverScatter />
    </ClientOnly>
  </div>
</template>
