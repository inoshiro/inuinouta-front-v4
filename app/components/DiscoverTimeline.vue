<template>
  <ClientOnly>
    <div class="space-y-6">
      <!-- Loading state -->
      <div v-if="library.songsStatus === 'pending'" class="text-center text-gray-400 py-12">
        読み込み中...
      </div>

      <!-- Error state -->
      <div v-else-if="library.songsStatus === 'error'" class="text-center text-gray-400 py-12">
        データの読み込みに失敗しました
      </div>

      <template v-else-if="library.songsStatus === 'ready'">
        <!-- Bar chart -->
        <div>
          <h2 class="mb-4 text-lg font-bold text-gray-50">年別楽曲数</h2>
          <div class="overflow-x-auto pb-2">
            <div class="flex items-end gap-1" style="min-width: max-content; height: 160px">
              <div
                v-for="year in years"
                :key="year"
                class="flex cursor-pointer flex-col items-center gap-1"
                style="min-width: 48px"
                @click="selectYear(year)"
              >
                <!-- Bar -->
                <div class="flex w-full flex-col items-center justify-end" style="height: 128px">
                  <div
                    class="w-full transition-colors"
                    :class="
                      selectedYear === year
                        ? 'bg-action-primary'
                        : 'bg-surface-overlay hover:bg-action-primary-hover'
                    "
                    :style="{ height: barHeight(year) }"
                  />
                </div>
                <!-- Count -->
                <span
                  class="text-xs"
                  :class="selectedYear === year ? 'text-selected-text' : 'text-gray-400'"
                >
                  {{ songsByYear.get(year)?.length ?? 0 }}
                </span>
                <!-- Year label -->
                <span
                  class="text-xs font-medium"
                  :class="selectedYear === year ? 'text-selected-text' : 'text-gray-400'"
                >
                  {{ year }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Selected year song list -->
        <div v-if="selectedYear !== null">
          <div class="mb-3 flex items-center justify-between border-b border-border-default pb-2">
            <h3 class="font-bold text-gray-50">
              {{ selectedYear }}年の楽曲（{{ selectedSongs.length }}曲）
            </h3>
            <button
              class="text-sm text-gray-400 hover:text-gray-50"
              @click="selectedYear = null"
            >
              閉じる
            </button>
          </div>
          <ul class="divide-y divide-border-default">
            <li
              v-for="(song, index) in selectedSongs"
              :key="song.id"
              class="group flex items-center gap-3 py-2 hover:bg-surface-raised"
            >
              <!-- Song info -->
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm text-gray-50">{{ song.title }}</p>
                <p class="truncate text-xs text-gray-400">
                  {{ song.artist ?? '不明' }}
                  <span class="mx-1">·</span>
                  {{ song.video.title }}
                </p>
              </div>
              <!-- Action buttons -->
              <div class="flex shrink-0 gap-1">
                <button
                  class="px-2 py-1 text-xs text-gray-400 hover:bg-action-primary hover:text-gray-50"
                  title="再生"
                  @click="queueActions.playAll(selectedSongs, index)"
                >
                  再生
                </button>
                <button
                  class="px-2 py-1 text-xs text-gray-400 hover:bg-surface-overlay hover:text-gray-50"
                  title="次に再生"
                  @click="queueActions.playNext(song)"
                >
                  次へ
                </button>
                <button
                  class="px-2 py-1 text-xs text-gray-400 hover:bg-surface-overlay hover:text-gray-50"
                  title="キューに追加"
                  @click="queueActions.addToQueue(song)"
                >
                  追加
                </button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Prompt to select a year -->
        <p v-else class="text-sm text-gray-400">年をクリックすると楽曲一覧を表示します</p>
      </template>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Song } from '~/types'

const library = useLibraryStore()

onMounted(() => {
  library.fetchSongs()
})

// Group songs by year derived from video.published_at
const songsByYear = computed<Map<number, Song[]>>(() => {
  const map = new Map<number, Song[]>()
  for (const song of library.allSongs) {
    const year = new Date(song.video.published_at).getFullYear()
    const entry = map.get(year)
    if (entry) {
      entry.push(song)
    } else {
      map.set(year, [song])
    }
  }
  return map
})

const years = computed(() => [...songsByYear.value.keys()].sort((a, b) => a - b))

const maxCount = computed(() => {
  let max = 0
  for (const songs of songsByYear.value.values()) {
    if (songs.length > max) max = songs.length
  }
  return max
})

function barHeight(year: number): string {
  const count = songsByYear.value.get(year)?.length ?? 0
  if (maxCount.value === 0) return '4px'
  const pct = Math.max(count / maxCount.value, 0.02)
  return `${Math.round(pct * 100)}%`
}

const selectedYear = ref<number | null>(null)

const selectedSongs = computed<Song[]>(() => {
  if (selectedYear.value === null) return []
  return songsByYear.value.get(selectedYear.value) ?? []
})

function selectYear(year: number) {
  selectedYear.value = selectedYear.value === year ? null : year
}

const queueActions = useQueueActions()
</script>
