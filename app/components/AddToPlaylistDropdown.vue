<template>
  <div class="relative" :class="{ 'dropdown-open': open }">
    <button
      class="p-1 text-gray-400 hover:text-white"
      title="プレイリストに追加"
      @click.stop="toggle"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-full z-50 mt-1 w-52 border border-border-default bg-surface-raised shadow-lg"
      @click.stop
    >
      <!-- Create mode: inline name input -->
      <template v-if="isCreating">
        <div class="p-3">
          <p class="mb-1.5 text-xs text-gray-400">新規プレイリスト名</p>
          <input
            ref="createInput"
            v-model="newName"
            class="w-full border border-border-default bg-surface-overlay px-2 py-1 text-xs text-gray-50 focus:border-accent focus:outline-none"
            placeholder="名前を入力"
            maxlength="100"
            @keydown.enter="handleCreate"
            @keydown.escape="open = false"
          />
          <div class="mt-2 flex justify-end gap-3">
            <button class="text-xs text-gray-400 hover:text-white" @click="open = false">
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

      <!-- List mode: existing playlists -->
      <template v-else>
        <div v-if="playlists.length === 0" class="px-3 py-3 text-center text-xs text-gray-400">
          プレイリストがありません
        </div>
        <button
          v-for="pl in playlists"
          :key="pl.id"
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-surface-overlay"
          @click="addTo(pl.id)"
        >
          <span class="flex-1 truncate text-gray-50">{{ pl.name }}</span>
        </button>
        <div class="border-t border-border-default">
          <button
            class="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-400 hover:bg-surface-overlay hover:text-white"
            @click="isCreating = true"
          >
            <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            新規プレイリスト
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ songId: number; songTitle: string }>()

const playlistsStore = usePlaylistsStore()
const { success } = useNotifications()
const open = ref(false)
const isCreating = ref(false)
const newName = ref('')
const createInput = ref<HTMLInputElement | null>(null)

const playlists = computed(() => playlistsStore.playlists)

function toggle() {
  open.value = !open.value
  if (open.value) {
    playlistsStore.loadFromStorage()
    isCreating.value = false
  }
}

function addTo(playlistId: string) {
  const pl = playlistsStore.getById(playlistId)
  if (!pl) return
  playlistsStore.addSong(playlistId, props.songId)
  success(`「${props.songTitle}」を「${pl.name}」に追加しました`, `/playlists/${playlistId}`)
  open.value = false
}

function handleCreate() {
  const name = newName.value.trim()
  if (!name) return
  const created = playlistsStore.createPlaylist(name, '', [props.songId])
  success(`プレイリスト「${name}」を作成して追加しました`, `/playlists/${created.id}`)
  isCreating.value = false
  newName.value = ''
  open.value = false
}

watch(isCreating, (val) => {
  if (val) nextTick(() => createInput.value?.focus())
})

function handleOutsideClick() {
  open.value = false
}
onMounted(() => document.addEventListener('click', handleOutsideClick))
onBeforeUnmount(() => document.removeEventListener('click', handleOutsideClick))
</script>
