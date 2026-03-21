---
applyTo: 'app/composables/**/*.ts'
---

- Composable の関数名は `use` プレフィックスを付ける（例: `useSongs`, `usePlayback`）
- ファイル名も `use` プレフィックスの camelCase（例: `useSongs.ts`）
- API 呼び出しには `useApi()` が返す `$api<T>()`（直接フェッチ）または `useApiFetch<T>()`（リアクティブ）を使用する
- API レスポンスの型は `app/types/index.ts` で定義されたインターフェース（`SongsResponse`, `VideoResponse` 等）を使用する
- Nuxt の auto-import を活用する（`ref`, `computed`, `watch` 等の import 文は書かない）
- `defineStore` は composable ではなく `app/stores/` に配置する
