<template>
  <div class="flex h-dvh flex-col bg-surface-base text-gray-50">
    <!-- Mobile header -->
    <header class="flex h-14 items-center gap-3 border-b border-border-default px-4 lg:hidden">
      <NuxtLink to="/" class="text-lg font-bold">inuinouta</NuxtLink>
      <div class="flex-1" />
      <SearchBar />
      <NuxtLink to="/about" class="shrink-0 text-gray-400 hover:text-white">
        <FontAwesomeIcon :icon="['fas', 'circle-info']" class="!h-5 !w-5" />
      </NuxtLink>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <SideNav />

      <!-- Main area + Queue panel -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Main content -->
        <div class="flex flex-1 flex-col overflow-hidden">
          <!-- Desktop header -->
          <header
            class="hidden h-14 items-center gap-4 border-b border-border-default px-6 lg:flex"
          >
            <SearchBar class="max-w-md flex-1" />
          </header>

          <!-- Page content -->
          <main class="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
            <slot />
          </main>
        </div>

        <!-- Queue panel (lg+: inline right panel / mobile: Teleport overlay) -->
        <QueueDrawer />
      </div>
    </div>

    <!-- Player bar -->
    <ClientOnly>
      <PlayerBar />
    </ClientOnly>

    <!-- Mobile bottom tab navigation -->
    <MobileBottomNav />

    <!-- Toast notifications (Teleport to body is handled inside) -->
    <AppToastRegion />

    <!-- Mobile now-playing overlay (Teleport to body is handled inside) -->
    <ClientOnly>
      <MobileNowPlayingOverlay />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
// Background preload for songs/videos on every page so data is warm
// before the user navigates to /songs, /videos or /search
const library = useLibraryStore()
if (import.meta.client) {
  void callOnce('library-songs', () => library.fetchSongs())
  void callOnce('library-videos', () => library.fetchVideos())
}
</script>
