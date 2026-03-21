# ページパターン

## 一覧ページ（`pages/xxxs/index.vue`）

```vue
<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl font-bold">Xxx 一覧</h1>
      <!-- Optional: bulk action button -->
    </div>

    <!-- Loading -->
    <div v-if="status === 'pending'" class="space-y-2">
      <div v-for="n in 10" :key="n" class="h-14 animate-pulse bg-surface-raised" />
    </div>

    <!-- Content -->
    <div v-else>
      <!-- List or Grid -->
    </div>

    <!-- Pagination -->
    <div class="mt-6">
      <AppPagination :meta="meta" @update:page="page = $event" />
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Xxx 一覧 | inuinouta' })

const { xxxs, meta, page, status } = useXxxs({ perPage: 50 })
</script>
```

### ポイント

- 2状態: `status === 'pending'`（ローディング） → `v-else`（コンテンツ）
- スケルトンは `animate-pulse bg-surface-raised` で統一
- ページネーションは `AppPagination` コンポーネントを使用
- グリッド表示の場合: `grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`

## 詳細ページ（`pages/xxxs/[id].vue`）

```vue
<template>
  <!-- Loading -->
  <div v-if="status === 'pending'" class="space-y-4">
    <div class="h-8 w-48 animate-pulse bg-surface-raised" />
    <div class="aspect-video max-w-md animate-pulse bg-surface-raised" />
  </div>

  <!-- Content -->
  <div v-else-if="xxx" class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
      <!-- Image (if applicable) -->
      <!-- Info + Actions -->
    </div>

    <!-- Related section (if applicable) -->
    <section class="border-t border-border-default pt-4">
      <h2 class="mb-2 text-sm font-bold text-gray-400">関連セクション</h2>
      <!-- Related items -->
    </section>
  </div>

  <!-- Not found -->
  <div v-else class="text-center text-gray-500">見つかりませんでした</div>
</template>

<script setup lang="ts">
const route = useRoute()
const xxxId = route.params.id as string

const { xxx, status } = useXxx(xxxId)

useHead({
  title: computed(() => (xxx.value ? `${xxx.value.name} | inuinouta` : 'inuinouta')),
})
</script>
```

### ポイント

- 3状態: pending → コンテンツ → not found
- 動的タイトル: `useHead` に `computed` で渡す
- アクションボタン: プライマリ（`bg-emerald-500`）、セカンダリ（`border border-border-default`）
- 関連セクション: `border-t border-border-default pt-4` で区切る
