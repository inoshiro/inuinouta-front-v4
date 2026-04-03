<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
        @click.self="$emit('close')"
      >
        <div class="w-full max-w-lg bg-surface-overlay flex flex-col max-h-[70vh]">
          <!-- Modal header -->
          <div class="flex items-center justify-between border-b border-border-default px-4 py-3">
            <h2 class="text-sm font-medium text-gray-50">アーティストを選択</h2>
            <button
              class="text-gray-400 hover:text-gray-50 transition-colors"
              aria-label="閉じる"
              @click="$emit('close')"
            >
              ✕
            </button>
          </div>

          <!-- Search input -->
          <div class="border-b border-border-default px-4 py-2">
            <input
              v-model="searchQuery"
              type="text"
              autocomplete="off"
              placeholder="アーティスト名で絞り込む"
              class="w-full bg-transparent text-sm text-gray-50 placeholder-gray-500 outline-none"
            />
          </div>

          <!-- Artist list -->
          <div class="overflow-y-auto px-4 py-3">
            <div class="flex flex-wrap gap-2">
              <!-- All artists (clear) button -->
              <button
                class="border px-3 py-1.5 text-sm transition-colors"
                :class="
                  selectedArtist === ''
                    ? 'border-selected-border bg-selected-bg/10 text-selected-text'
                    : 'border-border-default text-gray-400 hover:text-gray-50'
                "
                @click="$emit('select', '')"
              >
                全アーティスト
              </button>

              <!-- Artist buttons -->
              <button
                v-for="artist in filteredArtists"
                :key="artist.name"
                class="border px-3 py-1.5 text-sm transition-colors"
                :class="
                  selectedArtist === artist.name
                    ? 'border-selected-border bg-selected-bg/10 text-selected-text'
                    : 'border-border-default text-gray-400 hover:text-gray-50'
                "
                @click="$emit('select', artist.name)"
              >
                {{ artist.name }}<span class="ml-1.5 text-xs opacity-60">{{ artist.count }}</span>
              </button>
            </div>

            <!-- Empty state -->
            <p v-if="filteredArtists.length === 0" class="py-6 text-center text-sm text-gray-400">
              アーティストが見つかりませんでした
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { ArtistWithCount } from '~/composables/useSongs'

const props = defineProps<{
  isOpen: boolean
  selectedArtist: string
  artists: ArtistWithCount[]
}>()

defineEmits<{
  close: []
  select: [artistName: string]
}>()

const searchQuery = ref('')

const filteredArtists = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return props.artists
  return props.artists.filter((a) => a.name.toLowerCase().includes(q))
})

// Reset search when modal opens
watch(
  () => props.isOpen,
  (open) => {
    if (open) searchQuery.value = ''
  },
)
</script>
