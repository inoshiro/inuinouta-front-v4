<template>
  <Teleport to="body">
    <Transition name="sheet-backdrop">
      <div
        v-if="open"
        class="fixed inset-0 z-60 bg-black/50 lg:hidden"
        @click.self="$emit('close')"
      />
    </Transition>

    <Transition name="sheet-slide">
      <div
        v-if="open"
        class="fixed inset-x-0 bottom-0 z-60 flex max-h-[60vh] flex-col border-t border-border-default bg-surface-raised lg:hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3">
          <p class="text-sm font-medium text-gray-50">プレイリストに追加</p>
          <button class="p-1 text-gray-400 hover:text-white" @click="$emit('close')">
            <FontAwesomeIcon :icon="['fas', 'xmark']" class="h-5 w-5" />
          </button>
        </div>

        <!-- Playlist list (scrollable) -->
        <div class="flex-1 overflow-y-auto">
          <button
            v-for="pl in playlists"
            :key="pl.id"
            class="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-overlay"
            @click="handleAdd(pl.id)"
          >
            <FontAwesomeIcon :icon="['fas', 'music']" class="h-4 w-4 shrink-0 text-gray-400" />
            <span class="flex-1 truncate text-sm text-gray-50">{{ pl.name }}</span>
          </button>

          <p v-if="playlists.length === 0" class="px-4 py-6 text-center text-sm text-gray-500">
            プレイリストがありません
          </p>
        </div>

        <!-- Create new -->
        <div class="border-t border-border-default">
          <template v-if="isCreating">
            <div class="px-4 py-3">
              <p class="mb-1.5 text-xs text-gray-400">新規プレイリスト名</p>
              <input
                ref="createInputRef"
                v-model="newName"
                type="text"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                class="w-full border border-border-default bg-surface-overlay px-3 py-2 text-base sm:text-sm text-gray-50 focus:border-accent focus:outline-none"
                placeholder="名前を入力"
                maxlength="100"
                @keydown.enter="handleCreate"
                @keydown.escape="isCreating = false"
              />
              <div class="mt-2 flex justify-end gap-3">
                <button class="text-xs text-gray-400 hover:text-white" @click="isCreating = false">
                  キャンセル
                </button>
                <button
                  class="text-xs text-selected-text hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  :disabled="!newName.trim()"
                  @click="handleCreate"
                >
                  作成して追加
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <button
              class="flex w-full items-center gap-3 px-4 py-3 text-left text-gray-400 hover:bg-surface-overlay hover:text-white"
              @click="isCreating = true"
            >
              <FontAwesomeIcon :icon="['fas', 'plus']" class="h-4 w-4 shrink-0" />
              <span class="text-sm">新規プレイリスト</span>
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean
  songId: number
  songTitle: string
}>()

const emit = defineEmits<{
  close: []
}>()

const playlistsStore = usePlaylistsStore()
const { success } = useNotifications()

const playlists = computed(() => playlistsStore.playlists)

const isCreating = ref(false)
const newName = ref('')
const createInputRef = ref<HTMLInputElement | null>(null)

watch(
  () => props.open,
  (v) => {
    if (v) {
      playlistsStore.loadFromStorage()
      isCreating.value = false
    }
  },
)

watch(isCreating, async (v) => {
  if (v) {
    newName.value = ''
    await nextTick()
    createInputRef.value?.focus()
  }
})

function handleAdd(playlistId: string) {
  const pl = playlistsStore.getById(playlistId)
  if (!pl) return
  playlistsStore.addSong(playlistId, props.songId)
  success(`「${props.songTitle}」を「${pl.name}」に追加しました`, `/playlists/${playlistId}`)
  emit('close')
}

function handleCreate() {
  const name = newName.value.trim()
  if (!name) return
  const created = playlistsStore.createPlaylist(name, '', [props.songId])
  success(`プレイリスト「${name}」を作成して追加しました`, `/playlists/${created.id}`)
  isCreating.value = false
  newName.value = ''
  emit('close')
}
</script>

<style scoped>
/* Backdrop fade */
.sheet-backdrop-enter-active,
.sheet-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to {
  opacity: 0;
}

/* Sheet slide up */
.sheet-slide-enter-active {
  transition: transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}
.sheet-slide-leave-active {
  transition: transform 0.15s ease-in;
}
.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateY(100%);
}
</style>
