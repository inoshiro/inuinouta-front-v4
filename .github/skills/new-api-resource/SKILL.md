---
name: new-api-resource
description: 'Add a new API resource end-to-end: types, composables, components, and pages. Use when adding a new backend resource, endpoint, or CRUD page set to the Nuxt frontend.'
---

# New API Resource

新しい API リソースをフロントエンドに追加する際の、型定義からページまでの一連のワークフロー。

## When to Use

- バックエンドに新しいリソース（エンドポイント）が追加され、フロントエンドで表示・操作する必要がある
- 既存リソースと同等の一覧ページ・詳細ページのセットを追加する

## Procedure

以下の順序でファイルを作成・編集する。各ステップのテンプレートは references/ を参照。

### Step 1: 型定義（`app/types/index.ts`）

[型パターン参照](./references/type-patterns.md)

1. `XxxBasic` — 最小限のフィールド（他リソースへの埋め込み用）
2. `Xxx` or `XxxList` / `XxxDetail` — 用途に応じた拡張型（`extends XxxBasic`）
3. `XxxsResponse` / `XxxResponse` — dynamic-rest 形式のラッパー（複数形キー + `meta?`, 単数形キー）

既存の `app/types/index.ts` に追記する。新ファイルは作らない。

### Step 2: Composable（`app/composables/`）

[Composable パターン参照](./references/composable-patterns.md)

1. **一覧用**: `useXxxs.ts` — ページネーション・検索対応、`useApiFetch<XxxsResponse>()` 使用
2. **詳細用**: `useXxx.ts` — ID を受け取り単一リソースを返す

### Step 3: コンポーネント（`app/components/`）— 必要に応じて

既存の `SongCard` / `SongListItem` / `VideoCard` のパターンに従う。

- **Card**: グリッド表示用（サムネイル + 情報）
- **ListItem**: リスト表示用（横並び行）
- コンポーネントは表示に専念し、ロジックは composable に委譲する

### Step 4: ページ（`app/pages/`）

[ページパターン参照](./references/page-patterns.md)

1. **一覧**: `pages/xxxs/index.vue` — ヘッダー + ローディング（pending）/ コンテンツ の2状態 + ページネーション
2. **詳細**: `pages/xxxs/[id].vue` — ローディング（pending）/ コンテンツ / not found の3状態

### Step 5: 確認

- `pnpm build` でビルドエラーがないことを確認
- `pnpm lint` でリントエラーがないことを確認
