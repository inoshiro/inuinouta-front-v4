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
- アクセントカラー: emerald（後方互換トークン `accent` / `accent-hover` / `accent-muted` は残存。新規実装では役割名トークンを使うこと）
- 角丸なし（`rounded-*` を使わない）
- セマンティックカラートークン（`app/assets/css/main.css` の `@theme` で定義）:
  - `surface-base`（gray-950）/ `surface-raised`（gray-900）/ `surface-overlay`（gray-800）
  - `border-default`（gray-800）
- テキスト: 基本 `text-gray-50`、補助 `text-gray-400`

### カラートークン使い分けガイド

新規コンポーネント実装時は、`emerald-*` を直接使わず以下の役割名トークンを選ぶこと:

| トークン               | 使う場面                               | 例                                                     |
| ---------------------- | -------------------------------------- | ------------------------------------------------------ |
| `action-primary`       | クリックで何かを実行するボタン（CTA）  | すべて再生、保存、追加                                 |
| `action-primary-hover` | 上記のホバー状態                       | `hover:bg-action-primary-hover`                        |
| `selected-border`      | 現在の選択・フィルタ状態を示すボーダー | フィルタトグルのアクティブ枠                           |
| `selected-text`        | 現在の選択・フィルタ状態を示すテキスト | フィルタトグルのアクティブ文字、シャッフル ON アイコン |
| `selected-bg`          | 選択状態の半透明背景（`/10` で使用）   | `bg-selected-bg/10`                                    |
| `emphasis`             | 情報として目立たせたいバッジ・数値     | キュー件数バッジ                                       |
| `progress`             | 再生位置バー（状態表示）               | PlayerBar プログレスバー                               |

**❌ やってはいけないこと**: `bg-emerald-500`、`text-emerald-400` 等のハードコード  
**✅ 正しいパターン**: `bg-action-primary`、`text-selected-text` 等のトークン参照

## アーキテクチャ

- **レイアウト**: サイドバー + ヘッダー + メインエリア + PlayerBar（固定下部）+ QueueDrawer
- **Store**（`app/stores/`）: アプリ全体の永続的な状態（`player` = 再生状態、`queue` = キュー管理）
- **Composable**（`app/composables/`）: API データ取得・ページ固有ロジック・UI ヘルパー
- **YouTube IFrame API**: `app.vue` で `<ClientOnly>` 内に `<YouTubeEmbed>` を配置（SSR 対象外）
- **再生制御の責務分離**:
  - `player.play(song)`（store アクション）= UI の楽観的更新のみ。YouTube への命令は出さない
  - `requestPlay(song)`（`useYouTubePlayer` が提供）= YouTube IFrame への実再生要求
  - 楽曲を再生するすべての箇所で、この 2 つを**ユーザーイベントハンドラ内で同期的に**呼ぶこと

## iOS / モバイル再生の必須ルール

iOS Safari・Chrome（WebKit）は **user-gesture chain** の外で呼ばれた `play()` / `loadVideoById()` を無音でブロックする。
以下のルールを必ず守ること。

### ❌ やってはいけないこと

```ts
// NG: watch から再生を起動する（watch コールバックは user-gesture チェーン外）
watch(
  () => player.currentSong,
  (song) => {
    if (song) ytPlayer.loadVideoById(song.videoId) // iOS でブロックされる
  },
)
```

```html
<!-- NG: display:none や 0×0 の iframe は iOS WKWebView が再生をブロックする -->
<iframe :style="{ width: 0, height: 0 }" />
<iframe style="display: none" />
```

### ✅ 正しいパターン

```ts
// OK: ユーザーイベントハンドラ内で同期的に両方呼ぶ
function playSong(song: Song) {
  player.play(song) // UI 更新（ストア）
  requestPlay(song) // YouTube 実制御（user-gesture chain 内）
}
```

```html
<!-- OK: オフスクリーン配置で DOM に存在させる -->
<iframe style="position: fixed; top: -9999px; left: -9999px; width: 1px; height: 1px" />
```

### 再生トリガーのチェックリスト

楽曲再生に関わるコードを追加・変更する際は以下を確認すること:

- [ ] `player.play(song)` と `requestPlay(song)` を両方呼んでいるか
- [ ] `requestPlay(song)` がユーザーイベントハンドラの**同期**コールスタック内にあるか
- [ ] `watch` や `setTimeout` / `nextTick` 越しに `requestPlay` を呼んでいないか
- [ ] YouTube の iframe を `display:none` や `width:0/height:0` にしていないか

## Issue 対応ワークフロー

1. **調査・方針共有**: Issue に着手する前に、必ず調査結果と対応方針をユーザーに共有し、確認を得てから実装を開始する
   - 方針共有の内容: 問題の根本原因、修正箇所と理由、スコープ外にする理由（あれば）
2. **作業ブランチ作成**: 方針承認後、`feature/issue-<番号>-<概要>` の形式で作業ブランチを切る
   - 例: `feature/issue-5-data-loading`
   - 実装はすべて作業ブランチ上で行い、`main` へは直接 commit しない
3. **実装**: 作業ブランチ上で実装する
4. **UI プレビュー確認（UI 影響がある場合）**: コンポーネントや画面レイアウトに変更を加えた場合は、実装後に **UX Review エージェント** を呼び出し、簡単なアドバイスを求める
   - 対象の目安: Vue コンポーネント（`.vue`）の変更、CSS / Tailwind クラスの追加・変更、レイアウト構造・表示ロジックの変更
   - 求めるアドバイスの例: 色・スペーシングの整合性、アフォーダンスの明確さ、デザイン原則との整合
   - **Playwright は使わない**: コードレビューのみの簡易確認とし、ブラウザ起動・スクリーンショットは不要。エージェント呼び出し時に「Playwright を使わずコードベースのみで確認してください」と明示すること
5. **レビュー依頼**: 実装完了後、commit & push の前にユーザーに変更内容を提示してレビュー・目視確認を求める
6. **commit & push**: ユーザーの確認が取れてから作業ブランチに commit & push を行う
7. **PR 作成**: push 後に PR を作成し、Issue を参照してクローズする

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
