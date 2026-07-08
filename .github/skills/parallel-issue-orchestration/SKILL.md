---
name: parallel-issue-orchestration
description: >
  複数の独立 Issue を最大 3 件選定し、IssueWorker subagent で並列実装する際の
  独立性判断ルール・worktree 操作手順・Issue ラベル設計を定義する。
  Orchestrator agent および IssueWorker agent が参照する。
---

# Parallel Issue Orchestration

## 独立性判断ルール

以下のリソースを **2 件以上の Issue が共有する場合は同一バッチに入れない**。

| リソース種別 | 具体例                                        | 判断方法                                    |
| ------------ | --------------------------------------------- | ------------------------------------------- |
| Pinia store  | `app/stores/player.ts`, `app/stores/queue.ts` | Issue 本文・タイトルで store 名が被るか確認 |
| composable   | `app/composables/useYouTubePlayer.ts` 等      | 同上                                        |
| component    | `app/components/SongCard.vue` 等              | 同名ファイルを変更するか確認                |
| page         | `app/pages/songs/index.vue` 等                | 同じ page ディレクトリを変更するか確認      |
| API 型定義   | `app/types/index.ts`                          | 型追加・変更が必要か確認                    |
| lockfile     | `package.json`, `pnpm-lock.yaml`              | 依存追加が必要な場合は単独バッチにする      |

### ラベルによる補助

以下のラベルが付いている場合は優先的に参照する:

- `area:player-store` / `area:queue-store` / `area:component` / `area:page` / `area:api-type` — 変更領域
- `parallel-safe` — このラベルがある Issue は同一バッチ投入を許可（人間が事前に審査済み）
- `depends-on:NN` — Issue NN が完了するまで実装できない（バッチから必ず除外）

ラベルがない Issue は、本文と差分対象ファイルから Orchestrator が推論する。

---

## worktree 操作手順

### 責務の分担

| 操作          | 担当                               | タイミング                     |
| ------------- | ---------------------------------- | ------------------------------ |
| worktree 作成 | **Orchestrator**                   | subagent 起動前に一括作成      |
| ファイル編集  | **IssueWorker**                    | 受け取った worktree パス内のみ |
| worktree 削除 | **Orchestrator**（ユーザー確認後） | レビュー完了後に実行           |

worktree の作成・削除を Orchestrator に集約する理由:

- subagent に `run_in_terminal` が渡らないケースがある（VS Code chat モードなど）
- 作った者が後片付けの責任を持つ方が状態管理が一貫する

### Orchestrator による作成

```bash
# メインリポジトリのルートで実行すること
cd /home/kenjiro/projects/inuinouta-front-v4

# 選定した Issue 全件分を一括作成
git worktree add -b feature/issue-NN-<概要> worktrees/issue-NN main
# ... 残りの Issue も同様

# 全件確認してから subagent を起動する
git worktree list
```

### IssueWorker の作業範囲

- 受け取った worktree パス配下のファイルのみ編集する
- ファイル操作ツールには worktree パス配下の絶対パスを指定する
- `pnpm-lock.yaml` は変更しない（依存追加が必要なら Orchestrator に報告して中断）
- `.nuxt` / `.output` は worktree ごとに生成される。許容する。

### Orchestrator によるクリーンアップ（ユーザー確認後）

```bash
git worktree remove worktrees/issue-NN
git branch -d feature/issue-NN-<概要>   # マージ済みの場合のみ
```

**worktree の自動削除はしない。必ずユーザーの確認を取ってから実行する。**

### 確認コマンド

```bash
# main workspace で差分がないことを確認（worktree 分離の検証に使う）
cd /home/kenjiro/projects/inuinouta-front-v4
git status   # 変更なし = worktree 分離が機能している

# 全 worktree の一覧確認
git worktree list
```

---

## Orchestrator の出力フォーマット

subagent 起動前に必ずチャットに出力する:

```
## 選定結果

**選定**:
- #12 — SongCard コンポーネントのリファクタ（area:component / SongCard.vue のみ）
- #18 — /songs ページにフィルタ追加（area:page / songs/index.vue のみ）
- #25 — shuffle ロジック修正（area:player-store / stores/player.ts のみ）

**除外**:
- #20 — #12 と同じ SongCard.vue を変更するため除外
- #30 — depends-on:12 ラベルがあるため除外

**並列起動**: #12, #18, #25 を同時に IssueWorker へ委譲します
```

---

## 最小検証プロトコル（Step 3）のダミー Issue 判定例

以下の 4 件が open の状態で Orchestrator を起動したとき:

| Issue | area              | 変更対象ファイル | 期待される判定      |
| ----- | ----------------- | ---------------- | ------------------- |
| A     | area:component    | SongCard.vue     | ✅ 選定             |
| B     | area:page         | songs/index.vue  | ✅ 選定             |
| C     | area:component    | SongCard.vue     | ❌ 除外（A と衝突） |
| D     | area:player-store | stores/player.ts | ✅ 選定             |

**期待される選定**: A, B, D（3 件）  
**期待される除外**: C（A と同じ SongCard.vue のため）

この結果を再現できれば選定ロジックが機能している。
