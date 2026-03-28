---
applyTo: 'app/composables/**/*.ts'
---

- Composable の関数名は `use` プレフィックスを付ける（例: `useSongs`, `usePlayback`）
- ファイル名も `use` プレフィックスの camelCase（例: `useSongs.ts`）
- API 呼び出しには `useApi()` が返す `$api<T>()`（直接フェッチ）または `useApiFetch<T>()`（リアクティブ）を使用する
- API レスポンスの型は `app/types/index.ts` で定義されたインターフェース（`SongsResponse`, `VideoResponse` 等）を使用する
- Nuxt の auto-import を活用する（`ref`, `computed`, `watch` 等の import 文は書かない）
- `defineStore` は composable ではなく `app/stores/` に配置する

## 再生制御 composable のルール

`useYouTubePlayer` / `useQueueActions` / `usePlayback` などの再生制御 composable を実装・修正するときは以下を厳守する。

### iOS user-gesture chain の保持

iOS Safari / Chrome（WebKit）は user-gesture chain 外の `play()` / `loadVideoById()` を無音ブロックする。

**必須パターン**: 楽曲再生を起動するすべての関数で `player.play()` と `requestPlay()` を**同期的に**呼ぶ。

```ts
// ✅ 正しい実装
function playSong(song: Song) {
  player.play(song) // UI 楽観的更新（ストア）
  requestPlay(song) // YouTube への実再生要求（ジェスチャーチェーン内）
}

// ❌ NG: watch / nextTick / setTimeout 越しに requestPlay を呼ぶ
watch(
  () => player.currentSong,
  (song) => {
    if (song) requestPlay(song) // user-gesture チェーン外 → iOS でブロック
  },
)
```

### `useYouTubePlayer` の使い方

- `requestPlay(song)` — 新しい曲を読み込んで再生（イベントハンドラから同期呼び出し必須）
- `resumePlay()` — 一時停止中の再生を再開
- `pausePlay()` — 一時停止
- `retryPlay()` — autoplay がブロックされた（`player.isBlocked === true`）後の再試行
- `seekTo(seconds)` — シーク（PlayerBar の進捗バーなど）

### 新規の再生トリガーを追加するときの確認事項

- [ ] `player.play(song)` と `requestPlay(song)` を両方、同期的に呼んでいるか
- [ ] `watch` 起動・非同期処理越しに `requestPlay` を呼んでいないか
- [ ] `useYouTubePlayer()` が返す関数はモジュールレベルシングルトンを共有するため、複数コンポーネントから呼んでも安全
