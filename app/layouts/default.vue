<template>
  <div class="flex h-dvh flex-col bg-surface-base text-gray-50">
    <!-- Mobile header -->
    <header class="flex items-center gap-3 border-b border-border-default px-4 py-3 lg:hidden">
      <button class="text-gray-400 hover:text-white" @click="sideNavOpen = true">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <NuxtLink to="/" class="text-lg font-bold">inuinouta</NuxtLink>
      <div class="flex-1" />
      <SearchBar />
    </header>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <SideNav v-model:open="sideNavOpen" />

      <!-- Main area + Queue panel -->
      <div class="flex flex-1 overflow-hidden">
        <!-- Main content -->
        <div class="flex flex-1 flex-col overflow-hidden">
          <!-- Desktop header -->
          <header
            class="hidden items-center gap-4 border-b border-border-default px-6 py-3 lg:flex"
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
  </div>
</template>

<script setup lang="ts">
const sideNavOpen = ref(false)
</script>
