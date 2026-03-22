# Copilot カスタム指示

## プロジェクト概要

YouTube の歌動画を管理・再生する Web アプリケーションのフロントエンド。
バックエンドは Django REST Framework + dynamic-rest による API サーバー（別リポジトリ `inuinouta`）。

## 技術スタック

- **フレームワーク**: Nuxt 4 + Vue 3
- **言語**: TypeScript
- **状態管理**: Pinia v3（`@pinia/nuxt`）
- **スタイリング**: Tailwind CSS v4（Vite プラグインで統合）
- **フォント**: Noto Sans JP（Google Fonts）
- **テスト**: Vitest（ユニット）、Playwright（E2E）
- **リンター/フォーマッター**: ESLint + Prettier
- **パッケージマネージャー**: pnpm

## コーディングスタイル

- シングルクォート、セミコロンなし、trailing commas
- 2 スペースインデント、1 行 100 文字幅
- UI テキストは日本語、コード（変数名・コメント）は英語

## Nuxt の慣例

- `app/` ディレクトリ構成を使用
- Nuxt の auto-import を活用する（`ref`, `computed`, `useFetch`, `defineStore`, `navigateTo` 等の明示的 import は不要）
- Vue コンポーネントは Composition API `<script setup lang="ts">` のみ使用
- サーバーサイドレンダリング (SSR) 有効

## デザインシステム

- ダークモード専用（ライトモードなし）
- アクセントカラー: emerald（`accent` / `accent-hover` / `accent-muted`）
- 角丸なし（`rounded-*` を使わない）
- セマンティックカラートークン（`app/assets/css/main.css` の `@theme` で定義）:
  - `surface-base`（gray-950）/ `surface-raised`（gray-900）/ `surface-overlay`（gray-800）
  - `border-default`（gray-800）
- テキスト: 基本 `text-gray-50`、補助 `text-gray-400`

## アーキテクチャ

- **レイアウト**: サイドバー + ヘッダー + メインエリア + PlayerBar（固定下部）+ QueueDrawer
- **Store**（`app/stores/`）: アプリ全体の永続的な状態（`player` = 再生状態、`queue` = キュー管理）
- **Composable**（`app/composables/`）: API データ取得・ページ固有ロジック・UI ヘルパー
- **YouTube IFrame API**: `app.vue` で `<ClientOnly>` 内に `<YouTubeEmbed>` を配置（SSR 対象外）

## Issue 対応ワークフロー

1. **調査・方針共有**: Issue に着手する前に、必ず調査結果と対応方針をユーザーに共有し、確認を得てから実装を開始する
   - 方針共有の内容: 問題の根本原因、修正箇所と理由、スコープ外にする理由（あれば）
2. **作業ブランチ作成**: 方針承認後、`feature/issue-<番号>-<概要>` の形式で作業ブランチを切る
   - 例: `feature/issue-5-data-loading`
   - 実装はすべて作業ブランチ上で行い、`main` へは直接 commit しない
3. **実装**: 作業ブランチ上で実装する
4. **レビュー依頼**: 実装完了後、commit & push の前にユーザーに変更内容を提示してレビュー・目視確認を求める
5. **commit & push**: ユーザーの確認が取れてから作業ブランチに commit & push を行う
6. **PR 作成**: push 後に PR を作成し、Issue を参照してクローズする

## API プロキシ

- Nuxt サーバー側で `/api/*` へのリクエストを `runtimeConfig.apiBaseUrl` に設定された Django API にプロキシ
- `server/api/[...].ts` で `proxyRequest` を使用
- フロントエンドからの API 呼び出しは `/api/` パスに対して行う

## バックエンド API 仕様（Django REST Framework + dynamic-rest）

### 主要エンドポイント（参考）

| メソッド       | パス                   | 説明                                 |
| -------------- | ---------------------- | ------------------------------------ |
| GET            | `/api/videos/`         | 動画一覧（公開・非メンバー限定のみ） |
| GET            | `/api/videos/{id}/`    | 動画詳細（songs 埋め込み）           |
| GET            | `/api/songs/`          | 楽曲一覧                             |
| GET            | `/api/songs/{id}/`     | 楽曲詳細（video 埋め込み）           |
| GET            | `/api/random/`         | ランダム楽曲                         |
| GET/POST       | `/api/playlists/`      | プレイリスト一覧・作成               |
| GET/PUT/DELETE | `/api/playlists/{id}/` | プレイリスト詳細・更新・削除         |

### レスポンス形式（dynamic-rest）

レスポンスはリソース名をキーとしたオブジェクト:

```json
{ "songs": [...], "meta": { "page": 1, "per_page": 20, "total_results": 100, "total_pages": 5 } }
{ "song": { ... } }
```

### 主要な型定義（`app/types/index.ts`）

- `VideoBasic` / `VideoList` / `VideoDetail` — 動画
- `SongBasic` / `Song` — 楽曲（Song は video を埋め込み）
- `Playlist` / `PlaylistItem` — プレイリスト
- `SongsResponse` / `VideosResponse` 等 — API レスポンスラッパー（`meta` でページネーション）

### クエリパラメータ

- ページネーション: `?page=1&per_page=20`
- dynamic-rest のフィールド選択: `?include[]=field_name`
