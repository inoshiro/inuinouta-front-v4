---
name: issue-retrospective
description: >
  Issue 対応が完了し PR を作成した後に、実装精度を高めるための振り返りを行う。
  実装中に踏んだ罠・判断のブレ・チェック漏れを特定し、instructions.md・SKILL.md・copilot-instructions.md
  への具体的な改善提案に落とし込む。「ふりかえり」「振り返り」「retro」「改善案」などのキーワードで起動する。
---

# Issue Retrospective

PR 作成後、実装精度を上げるためのルーティン振り返り。  
成果物は感想文ではなく「次回の実装ルールの改訂案」。

---

## Step 1: 実装の diff を把握する

```bash
git log --oneline -5
git diff main...HEAD --stat
```

- 変更ファイルと変更規模を確認する
- 想定外のファイルが含まれていないか確認する（例: worktrees/, \*.png の混入）

---

## Step 2: 踏んだ罠・気づきを洗い出す

以下のカテゴリで確認する：

### A. 事前チェック漏れ

- 使ったアイコン・ライブラリが登録済みか確認したか？
  - FontAwesome の場合: `app/plugins/fontawesome.ts` の `library.add` に追加済みか
- 参照する型・composable のシグネチャを事前に確認したか？

### B. git コミット工程

- `git add -A` や `git add .` を使った場合、意図しないファイル（worktrees/, _.png, _.log）が staging に混入していないか
- `git diff --stat` で staging の中身を確認してからコミットしたか
- lint-staged によって自動 stash が走ったことで変更が消えていないか

### C. Vue / Nuxt 固有の落とし穴

- `watch(ref, callback)` で ref を直接渡したとき、vue.instructions.md の composable 返却ルール（computed の auto-unwrap）に注意が必要か確認したか
- `defineExpose` が必要なコンポーネントに追加できていたか
- SSR / `import.meta.client` ガードを適切に入れていたか
- Tailwind v4 の `!` 修飾子の記法（`!h-5` → `h-5!`）を最初から使えていたか

### D. iOS / モバイル固有の確認

- `@mousedown.prevent` を付けるべき場所に付けていたか
- `overscroll-contain` による背面スクロール抑止が入っていたか
- タップターゲットが 36px 以上確保されていたか

### E. UX Review との齟齬

- UX Review エージェントの指摘で想定外の修正が発生したか
- 発生した場合、その観点は実装前に自分でチェックできる類のものだったか

---

## Step 3: 各指摘を「ルール化できるか」で分類する

| 分類                                                                         | 対応                                        |
| ---------------------------------------------------------------------------- | ------------------------------------------- |
| 毎回チェックすべき → **チェックリスト追加**                                  | 対象 instructions.md または SKILL.md に追記 |
| 特定ファイルを変更するときに気をつける → **instructions.md の applyTo 強化** | 例: fontawesome.ts を変更するとき           |
| プロセスの問題 → **copilot-instructions.md のワークフロー修正**              | 例: git add のルール                        |
| 一度きりの個別事情 → 記録不要                                                | —                                           |

---

## Step 4: 改善案をファイルに落とし込む

改善提案は必ず「どのファイルのどのセクションに何を追加/変更するか」まで具体化する。

### 改善提案の出力フォーマット

```
### [対象ファイル: パス]

**追加/変更する場所**: セクション名または行の前後コンテキスト
**変更内容**:
（追加するルールや警告の文章）
**理由**: 今回どんな問題があったか（1行）
```

---

## Step 5: 実際にファイルを更新する

ユーザーに改善案を提示し、確認を得てから以下を実行：

1. 対象 instructions.md / SKILL.md を編集する
2. 変更が軽微なメモレベルなら `/memories/` に書き込む
3. `copilot-instructions.md` のワークフロー変更は影響範囲が大きいため、ユーザーと合意してから行う

---

## Step 6: 改善内容を main に PR する

ファイル更新後、変更を commit して main への PR を作成する。

```bash
# まず main に切り替えて最新化する（Issue 対応直後は作業ブランチのままの可能性がある）
git checkout main && git pull

# 振り返り専用ブランチを切る
git checkout -b chore/retro-issue-<番号>

# 変更ファイルを明示的に add
git add .github/skills/... .github/instructions/... .github/copilot-instructions.md

# コミット
git commit -m "chore: update instructions/skills based on issue-<番号> retro"

# push
git push -u origin chore/retro-issue-<番号>
```

PR 本文には以下を含める：

```
## 振り返りで見つかった改善点

- （変更した指示・スキルの内容と理由を箇条書き）

Issue #<番号> の実装を通じて見つかった改善なので、関連 Issue を参照として記載。
```

- PR は `main` ブランチ向けに作成する
- コミット対象は `.github/` 配下の指示・スキルファイルのみ（アプリコードは含めない）

---

## チェックリスト（Issue 対応完了時に毎回確認）

- [ ] `git diff --stat` で staging を確認してからコミットした
- [ ] 新規使用した FontAwesome アイコンを `fontawesome.ts` に登録した
- [ ] 新規使用した Tailwind v4 の `!` 修飾子の記法が正しい（`h-5!` など）
- [ ] モバイルのタップターゲットが 36px 以上ある要素を確認した
- [ ] UX Review で出た指摘が「次回は事前に気づける類か」を確認した
