---
applyTo: 'app/plugins/**'
---

- `.client.ts` サフィックスは SSR 非実行を保証するが、**クライアント側の実行タイミング**までは保証しない
- Nuxt の `app:mounted` フックは `vueApp.mount()` が return した直後に発火する。しかし `<NuxtLayout>` /
  `<NuxtPage>` は内部で `<Suspense>` を使った非同期コンポーネントとしてマウントされるため、レイアウト・ページの
  実際の hydration が `app:mounted` の時点でまだ終わっていないことがある（`nuxtApp.isHydrating` で管理）
- localStorage 等から読み込んだ値を、テンプレートで参照されている reactive state（store 等）へ反映する処理は
  `app:mounted` ではなく **`app:suspense:resolve`**（全ての hydration 完了後に発火）を使う

```ts
// ❌ NG: レイアウト/ページの hydration と競合し、DOM が SSR 時点の値のまま固まることがある
nuxtApp.hook('app:mounted', () => {
  usePlaylistsStore().loadFromStorage()
})

// ✅ OK
nuxtApp.hook('app:suspense:resolve', () => {
  usePlaylistsStore().loadFromStorage()
})
```

**症状の見分け方**: ブラウザコンソールに `[Vue warn]: Hydration attribute/class mismatch` と
`Hydration completed but contains mismatches.` が出て、画面の表示が更新されない場合はこのタイミング競合を疑う。
警告に出る `expected on client` の値が正しければ、データは合っているのに DOM だけ古い＝ hydration タイミングの問題。
Vue の mismatch チェックは check-only（DOM を自動修正しない）ため、一度ズレると通常のリアクティブ更新では直らない。
