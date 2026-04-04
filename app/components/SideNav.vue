<template>
  <!-- Mobile overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-40 bg-black/60 lg:hidden"
        @click="emit('update:open', false)"
      />
    </Transition>
  </Teleport>

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-border-default bg-surface-base transition-transform duration-200 lg:static lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- Logo -->
    <div class="flex h-14 items-center border-b border-border-default px-4">
      <NuxtLink to="/" class="text-lg font-bold tracking-tight" @click="close">
        inuinouta
      </NuxtLink>
      <button class="ml-auto text-gray-400 hover:text-white lg:hidden" @click="close">
        <FontAwesomeIcon :icon="['fas', 'xmark']" class="h-5 w-5" />
      </button>
    </div>

    <!-- Nav links -->
    <nav class="flex-1 space-y-1 px-3 py-4">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-surface-overlay hover:text-white"
        active-class="!bg-surface-overlay !text-selected-text"
        @click="close"
      >
        <FontAwesomeIcon :icon="item.icon" class="h-5 w-5 shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </nav>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()

function close() {
  emit('update:open', false)
}

const navItems: { to: string; label: string; icon: [string, string] }[] = [
  { to: '/', label: 'ホーム', icon: ['fas', 'house'] },
  { to: '/songs', label: '楽曲', icon: ['fas', 'music'] },
  { to: '/videos', label: '動画', icon: ['fas', 'video'] },
  { to: '/search', label: '検索', icon: ['fas', 'magnifying-glass'] },
  { to: '/playlists', label: 'プレイリスト', icon: ['fas', 'list'] },
  { to: '/about', label: 'このサイトについて', icon: ['fas', 'circle-info'] },
]
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
