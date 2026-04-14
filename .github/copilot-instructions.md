# Copilot カスタム指示

## プロジェクト概要

YouTube の歌動画を管理・再生する Web アプリケーションのフロントエンド。
バックエンドは Django REST Framework + dynamic-rest による API サーバー（別リポジトリ `inuinouta`）。

## このファイルの役割

- このファイルには、常時読む価値が高い横断ルールだけを書く
- ファイル種別ごとの詳細ルールは `.github/instructions/*.md` を正本として参照する
- API / composable / testing / Vue の細かな実装規約は、対象ファイルに応じた instruction 側を優先する

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
4. **UI プレビュー確認（重めの UI 変更のみ）**: 以下のいずれかに該当する「重めの UI 変更」を含む場合、**UX Review エージェント** を read-only の並走役として起動し、Playwright による最小限の画面確認を行わせる
   - **対象となる変更（重めの UI 変更）**:
     - レイアウト構造が変わる変更（ページ構成、ヘッダー、サイドバー、PlayerBar、QueueDrawer など）
     - 表示状態の切り替えが増える変更（modal、drawer、bottom sheet、tab、accordion、filter panel の追加・再設計）
     - レスポンシブ挙動に影響する変更（モバイル/デスクトップの見せ方、固定要素、スクロール挙動）
     - 主要導線に触る変更（再生、キュー追加、保存、検索、絞り込み、遷移の入り口）
   - **対象外**: 文言変更、色や余白の微調整、アイコン差し替え、単一コンポーネント内の軽微な Tailwind 修正
   - **起動タイミング**: 画面の最低限の表示が成立し、主要導線が 1 本つながった段階で起動する
   - **UX Review Agent の役割**: read-only。コード修正は行わず findings の提示のみ担当する
   - **確認優先項目**: 初期表示、モバイル幅/デスクトップ幅での崩れ、主要 CTA、overlay / drawer / modal の開閉、固定要素とスクロールの干渉、テキストのはみ出し
   - **最終判断**: Playwright 確認は補助であり、E2E の完全性保証や最終 UX 判定の代替ではない。最終判断は人間の目視レビュー（手順 5）で行う
5. **レビュー依頼**: 実装完了後、commit & push の前にユーザーに変更内容を提示してレビュー・目視確認を求める
6. **commit & push**: ユーザーの確認が取れてから作業ブランチに commit & push を行う
   - コミット前に `git diff --stat` で staging を確認し、worktrees/ や \*.png 等の意図しないファイルが混入していないかチェックする
   - 対象ファイルを明示的に `git add <file>...` で追加する（`git add -A` や `git add .` は使わない）
7. **PR 作成**: push 後に PR を作成し、Issue を参照してクローズする
8. **振り返り（任意）**: PR 作成後、`issue-retrospective` スキルを使って実装中の踏んだ罠や気づきを整理し、instructions.md / SKILL.md の改善案を出す

## 詳細ルールへの入口

- API まわり: `.github/instructions/api.instructions.md`
- composable まわり: `.github/instructions/composables.instructions.md`
- Vue / UI 実装: `.github/instructions/vue.instructions.md`
- テスト: `.github/instructions/testing.instructions.md`
