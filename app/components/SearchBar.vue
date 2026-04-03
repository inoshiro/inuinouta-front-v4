<template>
  <div class="relative">
    <svg
      class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <input
      :value="query"
      type="search"
      autocomplete="off"
      spellcheck="false"
      placeholder="楽曲・動画を検索…"
      class="w-full border border-border-default bg-surface-raised py-2 pl-9 pr-8 text-sm text-gray-50 placeholder-gray-500 transition-colors focus:border-selected-border focus:outline-none"
      @input="search(($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="query"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
      @click="clear"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const { query, search, clear } = useSearch()
</script>
