<template>
  <div>
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl font-bold">プレイリスト</h1>
      <button
        class="self-start bg-action-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-action-primary-hover"
        @click="isCreating = true"
      >
        新規作成
      </button>
    </div>

    <!-- Inline create form -->
    <div
      v-if="isCreating"
      class="mb-4 flex items-center gap-3 border-b border-border-default px-3 py-3"
    >
      <input
        ref="nameInput"
        v-model="newName"
        type="text"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        class="flex-1 border border-border-default bg-surface-overlay px-3 py-2 text-base sm:text-sm text-gray-50 focus:border-accent focus:outline-none"
        placeholder="プレイリスト名"
        maxlength="100"
        @keydown.enter="handleCreate"
        @keydown.escape="cancelCreate"
      />
      <button
        class="bg-action-primary px-4 py-2 text-sm font-medium text-white hover:bg-action-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!newName.trim()"
        @click="handleCreate"
      >
        作成
      </button>
      <button class="text-sm text-gray-400 hover:text-white" @click="cancelCreate">
        キャンセル
      </button>
    </div>

    <!-- Playlist list -->
    <div v-if="playlistsStore.playlists.length > 0">
      <NuxtLink
        v-for="pl in playlistsStore.playlists"
        :key="pl.id"
        :to="`/playlists/${pl.id}`"
        class="group flex items-center gap-4 border-b border-border-default px-3 py-3 transition-colors hover:bg-surface-overlay"
      >
        <!-- List icon -->
        <FontAwesomeIcon :icon="['fas', 'list']" class="h-5 w-5 shrink-0 text-gray-500" />

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-gray-50">{{ pl.name }}</p>
          <p v-if="pl.description" class="truncate text-xs text-gray-500">{{ pl.description }}</p>
        </div>

        <!-- Meta -->
        <span class="shrink-0 text-xs text-gray-400">{{ pl.items.length }}曲</span>

        <!-- Chevron -->
        <FontAwesomeIcon
          :icon="['fas', 'chevron-right']"
          class="h-4 w-4 shrink-0 text-gray-600 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
        />
      </NuxtLink>
    </div>

    <!-- Empty state -->
    <div v-else-if="!isCreating" class="px-4 py-16 text-center">
      <FontAwesomeIcon :icon="['fas', 'music']" class="mx-auto mb-4 h-16 w-16 text-gray-600" />
      <p class="text-sm text-gray-400">プレイリストがありません</p>
      <p class="mt-1 text-xs text-gray-500">再生キューから保存してみましょう</p>
    </div>

    <!-- LocalStorage notice -->
    <div
      v-if="playlistsStore.playlists.length > 0"
      class="mt-6 flex items-start gap-2 border border-border-default px-4 py-3 text-sm text-gray-400"
    >
      <FontAwesomeIcon
        :icon="['fas', 'circle-info']"
        class="mt-0.5 h-4 w-4 shrink-0 text-gray-500"
      />
      <p>
        プレイリストはこのブラウザに保存されます。別のデバイスやブラウザからはアクセスできません。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'プレイリスト' })

const playlistsStore = usePlaylistsStore()
const { success } = useNotifications()

onMounted(() => {
  playlistsStore.loadFromStorage()
})

const isCreating = ref(false)
const newName = ref('')
const nameInput = ref<HTMLInputElement | null>(null)

watch(isCreating, (val) => {
  if (val) {
    nextTick(() => nameInput.value?.focus())
  }
})

function handleCreate() {
  const name = newName.value.trim()
  if (!name) return
  const created = playlistsStore.createPlaylist(name)
  success(`プレイリスト「${name}」を作成しました`, `/playlists/${created.id}`)
  newName.value = ''
  isCreating.value = false
}

function cancelCreate() {
  newName.value = ''
  isCreating.value = false
}
</script>
