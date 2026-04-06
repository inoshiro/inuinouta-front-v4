<template>
  <!-- Sidebar (PC only) -->
  <aside class="hidden w-56 flex-col border-r border-border-default bg-surface-base lg:flex">
    <!-- Logo -->
    <div class="flex h-14 items-center border-b border-border-default px-4">
      <NuxtLink to="/" class="text-lg font-bold tracking-tight">inuinouta</NuxtLink>
    </div>

    <!-- Nav links -->
    <nav class="flex-1 space-y-1 px-3 py-4">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-surface-overlay hover:text-white"
        active-class="!bg-surface-overlay !text-selected-text"
      >
        <FontAwesomeIcon :icon="item.icon" class="h-5 w-5 shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const navItems: { to: string; label: string; icon: [string, string] }[] = [
  { to: '/', label: 'ホーム', icon: ['fas', 'house'] },
  { to: '/songs', label: '楽曲', icon: ['fas', 'music'] },
  { to: '/videos', label: '歌枠', icon: ['fas', 'video'] },
  { to: '/playlists', label: 'プレイリスト', icon: ['fas', 'list'] },
  { to: '/discover', label: '探索', icon: ['fas', 'compass'] },
  { to: '/about', label: 'このサイトについて', icon: ['fas', 'circle-info'] },
]
</script>
