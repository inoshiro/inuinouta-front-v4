<template>
  <div>
    <!-- Back link -->
    <NuxtLink
      to="/playlists"
      class="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      プレイリスト一覧
    </NuxtLink>

    <!-- Not found -->
    <div v-if="!playlist" class="px-4 py-16 text-center">
      <p class="text-sm text-gray-400">プレイリストが見つかりません</p>
      <NuxtLink to="/playlists" class="mt-2 inline-block text-sm text-emerald-400 hover:underline">
        一覧に戻る
      </NuxtLink>
    </div>

    <template v-else>
      <!-- Header -->
      <div class="mb-6">
        <!-- Title / Edit -->
        <div v-if="isEditing" class="mb-3 flex items-center gap-3">
          <input
            ref="editInput"
            v-model="editName"
            class="flex-1 border border-border-default bg-surface-overlay px-3 py-2 text-sm text-gray-50 focus:border-accent focus:outline-none"
            maxlength="100"
            @keydown.enter="saveEdit"
            @keydown.escape="cancelEdit"
          />
          <button
            class="bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!editName.trim()"
            @click="saveEdit"
          >
            保存
          </button>
          <button class="text-sm text-gray-400 hover:text-white" @click="cancelEdit">
            キャンセル
          </button>
        </div>
        <div v-else class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-xl font-bold">{{ playlist.name }}</h1>
            <p v-if="playlist.description" class="mt-1 text-sm text-gray-400">
              {{ playlist.description }}
            </p>
          </div>
          <div class="flex shrink-0 gap-2">
            <button class="px-2 py-1 text-xs text-gray-400 hover:text-white" @click="startEdit">
              編集
            </button>
            <button
              class="px-2 py-1 text-xs text-gray-400 hover:text-red-400"
              @click="handleDelete"
            >
              削除
            </button>
          </div>
        </div>

        <!-- Meta + actions -->
        <div class="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span v-if="songs.length > 0" class="text-xs text-gray-400">
            {{ songs.length }}曲 &middot; {{ totalDuration }}
          </span>
          <div v-if="songs.length > 0" class="flex gap-2">
            <button
              class="bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-400"
              @click="handlePlayAll"
            >
              すべて再生
            </button>
            <button
              class="border border-border-default px-4 py-2 text-sm text-gray-400 transition-colors hover:text-white"
              @click="handleAddAllToQueue"
            >
              キューに追加
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="status === 'pending'" class="space-y-2">
        <div v-for="n in 5" :key="n" class="h-14 animate-pulse bg-surface-raised" />
      </div>

      <!-- Error -->
      <div v-else-if="status === 'error'" class="px-4 py-8 text-center text-sm text-gray-400">
        楽曲情報の取得に失敗しました
      </div>

      <!-- Song list with drag support -->
      <ClientOnly v-else-if="songs.length > 0">
        <VueDraggableNext
          v-model="draggableSongs"
          handle=".drag-handle"
          animation="150"
          @end="handleDragEnd"
        >
          <div
            v-for="(song, index) in draggableSongs"
            :key="`${song.id}-${index}`"
            class="flex items-center"
          >
            <!-- Drag handle -->
            <div
              class="drag-handle flex shrink-0 cursor-grab items-center justify-center px-1 text-gray-600 hover:text-gray-400 active:cursor-grabbing"
              title="ドラッグで並び替え"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </div>

            <!-- Song row (reusing SongListItem) -->
            <div class="min-w-0 flex-1">
              <SongListItem :song="song" :index="index">
                <template #extra-actions>
                  <button
                    class="p-1 text-gray-400 hover:text-red-400"
                    title="プレイリストから削除"
                    @click.stop="handleRemoveSong(index)"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </template>
              </SongListItem>
            </div>
          </div>
        </VueDraggableNext>
      </ClientOnly>

      <!-- Empty playlist -->
      <div v-else-if="status === 'ready'" class="px-4 py-8 text-center text-sm text-gray-400">
        このプレイリストにはまだ曲がありません
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { VueDraggableNext } from 'vue-draggable-next'
import type { Song } from '~/types'

const route = useRoute()
const playlistId = route.params.id as string

const playlistsStore = usePlaylistsStore()
const queueActions = useQueueActions()
const { success } = useNotifications()

onMounted(() => {
  playlistsStore.loadFromStorage()
})

const { playlist, songs, status, totalDuration, fetchSongs } = usePlaylistDetail(playlistId)

useHead({ title: computed(() => `${playlist.value?.name ?? 'プレイリスト'} | inuinouta`) })

// Fetch songs once store is loaded
watch(
  () => playlistsStore.loaded,
  (isLoaded) => {
    if (isLoaded) fetchSongs()
  },
  { immediate: true },
)

// Draggable songs mirror
const draggableSongs = ref<Song[]>([])

watch(
  songs,
  (newSongs) => {
    draggableSongs.value = [...newSongs]
  },
  { immediate: true },
)

function handleDragEnd(event: { oldIndex: number; newIndex: number }) {
  // vue-draggable-next has already updated draggableSongs via v-model; just persist to store
  playlistsStore.reorderItems(playlistId, event.oldIndex, event.newIndex)
}

function handlePlayAll() {
  if (songs.value.length === 0) return
  queueActions.playAll([...songs.value])
}

function handleAddAllToQueue() {
  songs.value.forEach((song) => queueActions.addToQueue(song))
}

function handleRemoveSong(index: number) {
  const pl = playlist.value
  if (!pl) return
  const item = pl.items[index]
  if (!item) return
  playlistsStore.removeSong(playlistId, item.id)
  draggableSongs.value.splice(index, 1)
}

// Edit
const isEditing = ref(false)
const editName = ref('')
const editInput = ref<HTMLInputElement | null>(null)

function startEdit() {
  if (!playlist.value) return
  editName.value = playlist.value.name
  isEditing.value = true
  nextTick(() => editInput.value?.focus())
}

function saveEdit() {
  const name = editName.value.trim()
  if (!name) return
  playlistsStore.updatePlaylist(playlistId, { name })
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}

// Delete
function handleDelete() {
  if (!confirm(`「${playlist.value?.name}」を削除しますか？`)) return
  const name = playlist.value?.name ?? 'プレイリスト'
  playlistsStore.deletePlaylist(playlistId)
  success(`「${name}」を削除しました`)
  navigateTo('/playlists')
}
</script>
