<template>
  <div class="border-b border-border-default">
    <!-- Tab header -->
    <div class="flex items-center gap-4 border-b border-border-default px-4 py-2">
      <button
        class="text-xs"
        :class="saveMode === 'new' ? 'font-medium text-gray-50' : 'text-gray-400 hover:text-white'"
        @click="saveMode = 'new'"
      >
        新規作成
      </button>
      <button
        class="text-xs"
        :class="
          saveMode === 'existing' ? 'font-medium text-gray-50' : 'text-gray-400 hover:text-white'
        "
        @click="saveMode = 'existing'"
      >
        既存に追加
      </button>
      <button class="ml-auto text-xs text-gray-400 hover:text-white" @click="handleCancel">
        ✕
      </button>
    </div>

    <!-- New: name input -->
    <div v-if="saveMode === 'new'" class="flex items-center gap-2 px-4 py-2">
      <input
        ref="saveInput"
        v-model="saveName"
        type="text"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        class="flex-1 border border-border-default bg-surface-overlay px-2 py-1 text-sm text-gray-50 focus:border-accent focus:outline-none"
        placeholder="プレイリスト名"
        maxlength="100"
        @keydown.enter="handleSaveAsNew"
        @keydown.escape="handleCancel"
      />
      <button
        class="text-xs text-selected-text hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!saveName.trim()"
        @click="handleSaveAsNew"
      >
        保存
      </button>
    </div>

    <!-- Existing: playlist list -->
    <div v-else class="max-h-44 overflow-y-auto">
      <div v-if="playlistsStore.playlists.length === 0" class="px-4 py-3 text-xs text-gray-400">
        まだプレイリストがありません
      </div>
      <button
        v-for="pl in playlistsStore.playlists"
        :key="pl.id"
        class="flex w-full items-center gap-2 px-4 py-2 text-left text-xs hover:bg-surface-overlay"
        @click="handleAddToExisting(pl)"
      >
        <span class="flex-1 truncate text-gray-50">{{ pl.name }}</span>
        <span class="text-gray-500">{{ pl.items.length }}曲</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ close: [] }>()

const queue = useQueueStore()
const playlistsStore = usePlaylistsStore()
const { success } = useNotifications()

const saveMode = ref<'new' | 'existing'>('new')
const saveName = ref('')
const saveInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  playlistsStore.loadFromStorage()
  nextTick(() => saveInput.value?.focus())
})

watch(saveMode, (mode) => {
  if (mode === 'new') {
    nextTick(() => saveInput.value?.focus())
  }
})

function handleSaveAsNew() {
  const name = saveName.value.trim()
  if (!name || queue.songs.length === 0) return
  const songIds = queue.songs.map((s) => s.id)
  const created = playlistsStore.createPlaylist(name, '', songIds)
  saveName.value = ''
  emit('close')
  success(
    `プレイリスト「${name}」を作成しました（${songIds.length}曲）`,
    `/playlists/${created.id}`,
  )
}

function handleAddToExisting(pl: { id: string; name: string }) {
  const songIds = queue.songs.map((s) => s.id)
  playlistsStore.addSongs(pl.id, songIds)
  emit('close')
  success(`「${pl.name}」に${songIds.length}曲を追加しました`, `/playlists/${pl.id}`)
}

function handleCancel() {
  saveName.value = ''
  emit('close')
}
</script>
