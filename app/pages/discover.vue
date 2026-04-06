<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold text-gray-50">探索</h1>
    <ClientOnly>
      <DiscoverTimeline />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: '探索' })
</script>
