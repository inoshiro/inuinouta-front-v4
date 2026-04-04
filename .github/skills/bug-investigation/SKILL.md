---
name: bug-investigation
description: >
  ランタイム動作の不具合（再生制御、状態遷移、イベントタイミングなど）を調査・修正する際の標準手順。
  外部 API や非同期イベントが絡む不具合に使う。コードを読むだけで確証が出ない場面に適用する。
---

# Bug Investigation

## 大原則

**外部 API（YouTube IFrame API など）の動的挙動はコード静的解析だけで確証を得ようとしない。**  
仮説が 2〜3 出た時点でログを仕込み、実動作で確認する。

---

## Step 1: コードを読んで仮説を立てる（上限 5〜10 分）

- バグの発生経路として疑わしい関数・イベントハンドラを特定する
- 仮説を 2〜3 に絞る（「〇〇が 2 回呼ばれている」「〇〇のタイミングで状態が変わっている」など）
- この時点で確証を求めない。「疑わしい」で十分

## Step 2: ログを仕込む

仮説に対応する `console.log` を追加する。ポイント：

- **誰が呼んだか**（呼び出し元の識別子を引数で渡す）
- **何回呼ばれたか**（ログが何行出るかで判断できる）
- **そのときの状態**（song id、currentIndex など）

```ts
// 例
function onSongEnd(source: string) {
  console.log(`[DEBUG][onSongEnd] source=${source} songId=${player.currentSong?.id}`)
  // ...
}
// 呼び出し元で
onSongEnd('ENDED event')
onSongEnd('time tracking')
```

## Step 3: 実動作で確認する

### Playwright MCP で自動化できる場合

- 「何をすれば確認できるか」の手順を先に決めてから動かす
- ビューポート設定 → navigate → 操作 → コンソール確認 の順
- 同じエラーが 2 回出たら即別アプローチに切り替える

### ユーザーに委ねる方が速い場合

以下の条件では迷わずユーザーに委ねる：

- UI の複雑な操作が必要
- Playwright で同じ操作に 2 回以上失敗した
- ユーザーが「自分で確認する」と言ったとき

**委ねるときに渡す情報はシンプルに：**

```
1. 何をトリガーにするか（例：キューに3曲入れて再生し、曲終端にシーク）
2. 何のログを見るか（例：[DEBUG][onSongEnd] が何回出るか）
3. 期待値（例：1回だけ出るはず。2回出たら二重呼び出しが確定）
```

コンソール出力のテキストをコピペしてもらうのが最も確実。

## Step 4: 原因を確定して修正する

ログから「何が何回起きたか」が分かったら原因を確定し、修正する。

- 修正は制御層（composable）で行い、UI 側への場当たり的な遅延やフラグを散らさない
- デバッグログは修正確定後に必ず削除してから commit

## Step 5: 再確認（修正後）

同じ操作で確認。ログが期待回数になっていれば完了。

---

## このプロジェクト固有のメモ

### Playwright MCP での Pinia / YouTube 操作

```ts
// Pinia ストア取得
const pinia = window.__VUE_DEVTOOLS_KIT_APP_RECORDS__?.[0]?.app?.config?.globalProperties?.$pinia
const queue = pinia.state.value.queue
const player = pinia.state.value.player

// YouTube プレイヤー操作
const yt = window.YT.get('yt-player')
yt.getCurrentTime() // 現在時刻
yt.seekTo(seconds, true) // シーク

// Pinia ストアを JS から直接操作（UI が邪魔なとき）
pinia.state.value.queue.isOpen = false
```

### `mcp_playwright_browser_evaluate` の使い方

```
// NG: run_code では const / var が使えない
// OK: evaluate の function キーに文字列で渡す
evaluate({ function: "() => { const p = window.YT.get('yt-player'); return p.getCurrentTime() }" })
```

### YouTube IFrame API の既知の挙動

- `loadVideoById()` 呼び出し直後に ENDED イベントが発火することがある（動画切り替え時）
- state 値: -1=UNSTARTED, 0=ENDED, 1=PLAYING, 2=PAUSED, 3=BUFFERING, 5=CUED
