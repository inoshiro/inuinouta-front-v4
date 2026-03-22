---
applyTo: '**/*.vue'
---

- Composition API の `<script setup lang="ts">` を必ず使用する
- コンポーネント名は PascalCase（例: `SongCard.vue`, `PlayerBar.vue`）
- スタイリングは Tailwind CSS v4 のユーティリティクラスを優先し、scoped CSS は最小限に
- Nuxt の auto-import を活用する（`ref`, `computed`, `watch`, `useRoute`, `navigateTo` 等の import 文は書かない）
- コンポーネントも auto-import されるため、import 文なしで `<template>` 内で直接使用する
- Props の定義は `defineProps<{ ... }>()` で型を指定する
- Emits の定義は `defineEmits<{ ... }>()` で型を指定する
- コンポーネントは表示に専念し、API 呼び出し・データ加工・Store 操作の組み合わせは composable に委譲する
- レスポンシブはモバイルファーストで `lg:` ブレークポイントを基準にする（サイドバー表示切替など）
- ブラウザ専用 API や YouTube IFrame など SSR 非対応の要素は `<ClientOnly>` で囲む
- 角丸（`rounded-*`）は使わない。セマンティックカラートークン（`surface-base`, `accent` 等）を優先する
- ダークモード専用のため、`bg-surface-base`（gray-950）や `bg-surface-raised`（gray-900）上に配置するテキストには**必ず明示的な色クラスを付ける**。色未指定のままにすると暗い背景で読めなくなる
  - 通常テキスト: `text-gray-50`
  - 補助テキスト: `text-gray-400`
  - アクセント: `text-emerald-400`
