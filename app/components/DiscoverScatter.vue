<script setup lang="ts">
import type { Song } from '~/types'

const library = useLibraryStore()
const { playSong } = useQueueActions()

// Ensure songs are loaded
onMounted(() => {
  library.fetchSongs()
})

// Lane definitions
const lanes = [
  { key: 'original-video', label: 'オリジナル歌動画', isOriginal: true, isStream: false },
  { key: 'original-stream', label: 'オリジナル歌配信', isOriginal: true, isStream: true },
  { key: 'cover-video', label: 'カバー歌動画', isOriginal: false, isStream: false },
  { key: 'cover-stream', label: 'カバー歌配信', isOriginal: false, isStream: true },
] as const

// Compute year range from data
const years = computed<number[]>(() => {
  const all = library.allSongs
  if (all.length === 0) return []
  const ys = all.map((s) => new Date(s.video.published_at).getFullYear())
  const min = Math.min(...ys)
  const max = Math.max(...ys, new Date().getFullYear())
  const result: number[] = []
  for (let y = min; y <= max; y++) result.push(y)
  return result
})

// Group songs by (lane, year)
type LaneKey = (typeof lanes)[number]['key']

const grouped = computed<Record<LaneKey, Record<number, Song[]>>>(() => {
  const result = {} as Record<LaneKey, Record<number, Song[]>>
  for (const lane of lanes) {
    result[lane.key] = {}
  }
  for (const song of library.allSongs) {
    const year = new Date(song.video.published_at).getFullYear()
    const lane = lanes.find(
      (l) => l.isOriginal === song.is_original && l.isStream === song.video.is_stream,
    )
    if (!lane) continue
    if (!result[lane.key][year]) result[lane.key][year] = []
    result[lane.key][year].push(song)
  }
  return result
})

// Tooltip state
const tooltip = ref<{ song: Song; x: number; y: number } | null>(null)

function showTooltip(event: MouseEvent, song: Song) {
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  tooltip.value = { song, x: rect.left + rect.width / 2, y: rect.top }
}

function hideTooltip() {
  tooltip.value = null
}

// Detail panel state
const selectedSong = ref<Song | null>(null)

function selectSong(song: Song) {
  selectedSong.value = selectedSong.value?.id === song.id ? null : song
}

function handlePlay(song: Song) {
  playSong(song)
}
</script>

<template>
  <ClientOnly>
    <div class="flex flex-col gap-4 p-4">
      <!-- Loading -->
      <div v-if="library.songsStatus !== 'ready'" class="text-gray-400 text-sm">
        読み込み中…
      </div>

      <template v-else>
        <!-- Scatter grid -->
        <div class="overflow-x-auto">
          <div class="min-w-max">
            <!-- Year header -->
            <div class="flex items-center mb-1">
              <div class="w-32 shrink-0" />
              <div class="flex gap-0.5">
                <div
                  v-for="year in years"
                  :key="year"
                  class="w-20 text-center text-xs text-gray-400"
                >
                  {{ year }}
                </div>
              </div>
            </div>

            <!-- Lane rows -->
            <div
              v-for="lane in lanes"
              :key="lane.key"
              class="flex items-start border-t border-border-default py-2"
            >
              <!-- Lane label -->
              <div class="w-32 shrink-0 pr-3 text-right text-xs text-gray-400 pt-1 leading-tight">
                {{ lane.label }}
              </div>

              <!-- Dot columns per year -->
              <div class="flex gap-0.5">
                <div
                  v-for="year in years"
                  :key="year"
                  class="w-20 flex flex-wrap gap-0.5 content-start min-h-6"
                >
                  <button
                    v-for="song in grouped[lane.key][year] ?? []"
                    :key="song.id"
                    class="w-2 h-2 bg-selected-bg/40 hover:bg-selected-bg/80 transition-colors cursor-pointer focus:outline-none focus:bg-action-primary"
                    :class="{ 'bg-action-primary!': selectedSong?.id === song.id }"
                    @mouseenter="showTooltip($event, song)"
                    @mouseleave="hideTooltip"
                    @click="selectSong(song)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detail panel -->
        <div
          v-if="selectedSong"
          class="border border-border-default bg-surface-raised p-4 flex flex-col gap-3"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-gray-50 font-medium">{{ selectedSong.title }}</p>
              <p v-if="selectedSong.artist" class="text-gray-400 text-sm mt-0.5">
                {{ selectedSong.artist }}
              </p>
              <p class="text-gray-400 text-xs mt-1">
                {{ new Date(selectedSong.video.published_at).getFullYear() }}年
                ・
                {{ selectedSong.is_original ? 'オリジナル' : 'カバー' }}
                ・
                {{ selectedSong.video.is_stream ? '歌配信' : '歌動画' }}
              </p>
            </div>
            <button
              class="text-gray-400 hover:text-gray-50 text-sm shrink-0"
              @click="selectedSong = null"
            >
              閉じる
            </button>
          </div>
          <button
            class="self-start bg-action-primary hover:bg-action-primary-hover text-gray-50 text-sm px-4 py-1.5 transition-colors"
            @click="handlePlay(selectedSong)"
          >
            再生
          </button>
        </div>
      </template>
    </div>

    <!-- Tooltip (fixed position) -->
    <Teleport to="body">
      <div
        v-if="tooltip"
        class="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full -mt-1"
        :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
      >
        <div class="bg-surface-overlay border border-border-default px-2 py-1 text-xs text-gray-50 whitespace-nowrap">
          <p>{{ tooltip.song.title }}</p>
          <p v-if="tooltip.song.artist" class="text-gray-400">{{ tooltip.song.artist }}</p>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>
