---
applyTo: 'tests/**'
---

- ユニットテストは `tests/unit/` に `*.test.ts` として配置し、Vitest で実行する
- E2E テストは `tests/e2e/` に `*.spec.ts` として配置し、Playwright で実行する
- テストランナーコマンド: `pnpm test:unit`（ユニット）、`pnpm test:e2e`（E2E）、`pnpm test`（両方）
- ユニットテストは `@nuxt/test-utils` の Nuxt 環境で実行される
- E2E テストは dev サーバーを自動起動して実行される

## ユニットテスト記述のコツ

### import パスは相対パスを使う

`tests/unit/` は Nuxt の tsconfig の `include` 対象外のため、`~/types` や `~/stores/...` の Nuxt エイリアスは IDE の型解決に失敗する。
**相対パスで import する。**

```ts
// NG
import type { Song } from '~/types'
// OK
import type { Song } from '../../app/types'
import { useQueueStore } from '../../app/stores/queue'
```

### Pinia store を直接テストする場合

`beforeEach` で `setActivePinia(createPinia())` を呼んでストアを初期化する。

```ts
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  setActivePinia(createPinia())
})
```

### store の配列要素に型が付かない場合

store の state として公開された配列が実行時に `any[]` 型になり、`(s) => s.id` の `s` が暗黙 `any` エラーになることがある。
**明示的に型を付けたヘルパー関数を用意する。**

```ts
// tests/unit/queueStore.test.ts の例
const ids = (arr: Song[]) => arr.map((s) => s.id)
// ...
expect(ids(queue.songs)).toEqual([2, 3, 1, 4])
```
