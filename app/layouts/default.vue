<template>
  <div class="flex h-dvh flex-col bg-surface-base text-gray-50">
    <!-- Mobile header -->
    <header class="flex h-14 items-center gap-3 border-b border-border-default px-4 lg:hidden">
      <!-- Back button: visible only while search is active -->
      <button
        v-if="isSearchActive"
        class="-ml-2 shrink-0 p-2 text-gray-400 hover:text-white"
        @click="closeSearch"
      >
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" class="h-5! w-5!" />
      </button>

      <!-- Title + spacer: hidden while search is active -->
      <template v-if="!isSearchActive">
        <NuxtLink to="/" class="shrink-0 text-lg font-bold">いぬいのうた</NuxtLink>
        <div class="flex-1" />
      </template>

      <!-- SearchBar: always mounted; expands to fill header when active -->
      <SearchBar
        ref="searchBarRef"
        :class="isSearchActive ? 'flex-1' : ''"
        @update:search-active="isSearchActive = $event"
      />

      <!-- About icon: hidden while search is active -->
      <NuxtLink
        v-if="!isSearchActive"
        to="/about"
        class="-mr-2 shrink-0 p-2 text-gray-400 hover:text-white"
      >
        <FontAwesomeIcon :icon="['fas', 'circle-info']" class="h-5! w-5!" />
      </NuxtLink>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <SideNav />

      <!-- Main area + Queue panel -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Main content -->
        <div class="relative flex flex-1 flex-col overflow-hidden">
          <!-- Desktop header -->
          <header
            class="hidden h-14 items-center gap-4 border-b border-border-default px-6 lg:flex"
          >
            <SearchBar class="max-w-md flex-1" />
          </header>

          <!-- Page content -->
          <main
            ref="mainEl"
            :class="[
              'flex-1 px-4 py-6 lg:px-6',
              isSearchActive ? 'overflow-hidden' : 'overflow-y-auto',
            ]"
            @scroll.passive="onMainScroll"
          >
            <slot />
          </main>

          <!-- Scroll to top -->
          <button
            v-if="showScrollTopButton && !isSearchActive"
            class="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center bg-surface-overlay text-gray-400 shadow-lg transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-selected-border"
            aria-label="最上部へ戻る"
            @click="scrollToTop('smooth')"
          >
            <FontAwesomeIcon :icon="['fas', 'arrow-up']" class="h-4! w-4!" />
          </button>
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
import type { ScrollBehaviorOption } from '~/composables/useMainScroll'

const isSearchActive = ref(false)
const searchBarRef = ref<{ close: () => void } | null>(null)

function closeSearch() {
  searchBarRef.value?.close()
}

// Background preload for songs/videos on every page so data is warm
// before the user navigates to /songs, /videos or /search
const library = useLibraryStore()
if (import.meta.client) {
  void callOnce('library-songs', () => library.fetchSongs())
  void callOnce('library-videos', () => library.fetchVideos())
}

// Main scroll ownership: <main> here, not window, is the scrollable element.
const mainEl = ref<HTMLElement | null>(null)
const showScrollTopButton = ref(false)
const SHOW_BUTTON_THRESHOLD = 300

function onMainScroll() {
  showScrollTopButton.value = (mainEl.value?.scrollTop ?? 0) >= SHOW_BUTTON_THRESHOLD
}

function prefersReducedMotion() {
  return import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function scrollToTop(behavior: ScrollBehaviorOption = 'auto') {
  const el = mainEl.value
  if (!el) return
  el.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : behavior })
}

provideMainScroll({ scrollToTop })

// Route changes (link navigation and browser back/forward) must not retain
// the previous page's scroll position on the shared <main> element.
const route = useRoute()
watch(
  () => route.fullPath,
  () => scrollToTop('auto'),
)
</script>
