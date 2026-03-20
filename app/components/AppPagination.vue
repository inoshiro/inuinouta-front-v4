<template>
  <div v-if="meta && meta.total_pages > 1" class="flex items-center justify-center gap-1">
    <!-- Previous -->
    <button
      class="px-3 py-1.5 text-sm text-gray-400 transition-colors hover:text-white disabled:opacity-30"
      :disabled="meta.page <= 1"
      @click="emit('update:page', meta.page - 1)"
    >
      前へ
    </button>

    <!-- Page numbers -->
    <template v-for="p in visiblePages" :key="p">
      <span v-if="p === '...'" class="px-2 py-1.5 text-sm text-gray-600">…</span>
      <button
        v-else
        class="min-w-[2rem] px-2 py-1.5 text-sm transition-colors"
        :class="
          p === meta.page
            ? 'bg-emerald-500 font-medium text-white'
            : 'text-gray-400 hover:bg-surface-overlay hover:text-white'
        "
        @click="emit('update:page', p as number)"
      >
        {{ p }}
      </button>
    </template>

    <!-- Next -->
    <button
      class="px-3 py-1.5 text-sm text-gray-400 transition-colors hover:text-white disabled:opacity-30"
      :disabled="meta.page >= meta.total_pages"
      @click="emit('update:page', meta.page + 1)"
    >
      次へ
    </button>
  </div>
</template>

<script setup lang="ts">
import type { PaginationMeta } from '~/types'

const props = defineProps<{ meta: PaginationMeta | undefined }>()
const emit = defineEmits<{ 'update:page': [value: number] }>()

const visiblePages = computed(() => {
  if (!props.meta) return []
  const { page, total_pages } = props.meta
  const pages: (number | string)[] = []

  if (total_pages <= 7) {
    for (let i = 1; i <= total_pages; i++) pages.push(i)
    return pages
  }

  pages.push(1)
  if (page > 3) pages.push('...')

  const start = Math.max(2, page - 1)
  const end = Math.min(total_pages - 1, page + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (page < total_pages - 2) pages.push('...')
  pages.push(total_pages)

  return pages
})
</script>
