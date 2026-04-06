<template>
  <ClientOnly>
    <div class="space-y-8">
      <!-- Bubble chart area -->
      <div class="flex flex-wrap gap-4 p-4">
        <button
          v-for="artist in artistStats"
          :key="artist.name"
          class="flex flex-col items-center justify-center gap-1 rounded-full border-2 text-center transition-colors"
          :class="
            selectedArtist === artist.name
              ? 'border-selected-border bg-selected-bg/10 text-selected-text'
              : 'border-border-default bg-surface-raised text-gray-50 hover:border-selected-border hover:text-selected-text'
          "
          :style="bubbleStyle(artist.count)"
          @click="toggleArtist(artist.name)"
        >
          <span class="line-clamp-2 px-2 text-xs font-medium leading-tight">
            {{ artist.name }}
          </span>
          <span class="text-xs opacity-70">{{ artist.count }}</span>
        </button>
      </div>

      <!-- Song list for selected artist -->
      <div v-if="selectedArtist !== null" class="border-t border-border-default">
        <div class="flex items-center justify-between px-4 py-3">
          <h2 class="font-bold text-gray-50">
            {{ selectedArtist }}
            <span class="ml-2 text-sm text-emphasis">{{ selectedSongs.length }}曲</span>
          </h2>
          <div class="flex gap-3">
            <button
              class="text-sm text-gray-400 hover:text-selected-text"
              @click="queueActions.playAll(selectedSongs)"
            >
              すべて再生
            </button>
            <button
              class="text-sm text-gray-400 hover:text-selected-text"
              @click="selectedArtist = null"
            >
              閉じる
            </button>
          </div>
        </div>
        <ul>
          <li
            v-for="song in selectedSongs"
            :key="song.id"
            class="group flex cursor-pointer items-center gap-3 border-b border-border-default px-3 py-2 transition-colors hover:bg-surface-overlay"
            @click="queueActions.playAll(selectedSongs, selectedSongs.indexOf(song))"
          >
            <!-- Thumbnail -->
            <img
              :src="song.video.thumbnail_path"
              :alt="song.title"
              class="h-10 shrink-0 object-cover"
              style="aspect-ratio: 16/9"
              loading="lazy"
            />
            <!-- Song info -->
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm text-gray-50">{{ song.title }}</p>
              <p class="truncate text-xs text-gray-500">{{ song.video.title }}</p>
            </div>
            <!-- Inline actions -->
            <div
              class="flex shrink-0 gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
            >
              <button
                class="p-1 text-gray-400 hover:text-white"
                title="次に再生"
                @click.stop="queueActions.playNext(song)"
              >
                <FontAwesomeIcon :icon="['fas', 'angles-right']" class="h-4 w-4" />
              </button>
              <button
                class="p-1 text-gray-400 hover:text-white"
                title="キューに追加"
                @click.stop="queueActions.addToQueue(song)"
              >
                <FontAwesomeIcon :icon="['fas', 'plus']" class="h-4 w-4" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Song } from '~/types'

const library = useLibraryStore()
const queueActions = useQueueActions()

// Aggregate song counts per artist
const artistStats = computed(() => {
  const map = new Map<string, Song[]>()
  for (const song of library.allSongs) {
    const key = song.artist ?? '不明'
    const bucket = map.get(key) ?? []
    bucket.push(song)
    map.set(key, bucket)
  }
  return Array.from(map.entries())
    .map(([name, songs]) => ({ name, count: songs.length, songs }))
    .sort((a, b) => b.count - a.count)
})

// Min/max counts for bubble sizing
const maxCount = computed(() => artistStats.value[0]?.count ?? 1)
const minCount = computed(() => artistStats.value.at(-1)?.count ?? 1)

const MIN_SIZE = 60
const MAX_SIZE = 180

function bubbleStyle(count: number) {
  const range = maxCount.value - minCount.value || 1
  const ratio = (count - minCount.value) / range
  const size = Math.round(MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE))
  return { width: `${size}px`, height: `${size}px` }
}

// Selected artist
const selectedArtist = ref<string | null>(null)

const selectedSongs = computed<Song[]>(() => {
  if (selectedArtist.value === null) return []
  return artistStats.value.find((a) => a.name === selectedArtist.value)?.songs ?? []
})

function toggleArtist(name: string) {
  selectedArtist.value = selectedArtist.value === name ? null : name
}

// Trigger data load if not yet fetched
onMounted(() => {
  library.fetchSongs()
})
</script>
