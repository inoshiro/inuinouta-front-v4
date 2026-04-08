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
      class="w-full border border-border-default bg-surface-raised py-2 pl-9 pr-8 text-base sm:text-sm text-gray-50 placeholder-gray-500 transition-colors focus:border-selected-border focus:outline-none"
      @input="search(($event.target as HTMLInputElement).value)"
      @keydown.enter="handleEnter"
      @keydown.escape="close"
      @focus="onFocus"
      @blur="onBlur"
    />
    <button
      v-if="query"
      class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
      @mousedown.prevent
      @click="clear"
    >
      <FontAwesomeIcon :icon="['fas', 'xmark']" class="h-4 w-4" />
    </button>
    <SearchDropdown
      v-if="isDropdownVisible"
      :songs="dropdownSongs"
      :videos="dropdownVideos"
      :has-songs="hasSongs"
      :has-videos="hasVideos"
      :is-empty="isEmpty"
      :query="query"
      @close="close"
    />
  </div>
</template>

<script setup lang="ts">
const { query, search, submit, clear } = useSearch()
const {
  isDropdownVisible,
  dropdownSongs,
  dropdownVideos,
  hasSongs,
  hasVideos,
  isEmpty,
  onFocus,
  onBlur,
  close,
} = useSearchDropdown(query)

function handleEnter() {
  close()
  submit()
}
</script>
