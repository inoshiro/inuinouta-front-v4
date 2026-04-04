<template>
  <div class="relative">
    <FontAwesomeIcon
      :icon="['fas', 'magnifying-glass']"
      class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
    />
    <input
      :value="query"
      type="text"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      placeholder="楽曲・動画を検索…"
      class="w-full border border-border-default bg-surface-raised py-2 pl-9 pr-8 text-sm text-gray-50 placeholder-gray-500 transition-colors focus:border-selected-border focus:outline-none"
      @input="search(($event.target as HTMLInputElement).value)"
      @keydown.enter="submit"
    />
    <button
      v-if="query"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
      @click="clear"
    >
      <FontAwesomeIcon :icon="['fas', 'xmark']" class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
const { query, search, submit, clear } = useSearch()
</script>
