<template>
  <nav
    class="flex items-stretch border-t border-border-default bg-surface-raised lg:hidden"
    style="padding-bottom: calc(env(safe-area-inset-bottom) + 6px)"
  >
    <NuxtLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-gray-400 transition-colors hover:text-white"
      active-class="!text-selected-text"
    >
      <FontAwesomeIcon :icon="item.icon" class="!h-4 !w-4 shrink-0" />
      <span>{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
const navItems: { to: string; label: string; icon: [string, string] }[] = [
  { to: '/', label: 'ホーム', icon: ['fas', 'house'] },
  { to: '/songs', label: '楽曲', icon: ['fas', 'music'] },
  { to: '/videos', label: '歌枠', icon: ['fas', 'video'] },
  { to: '/playlists', label: 'プレイリスト', icon: ['fas', 'list'] },
  { to: '/discover', label: '探索', icon: ['fas', 'compass'] },
]
</script>
