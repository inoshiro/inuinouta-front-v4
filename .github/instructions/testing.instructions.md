---
applyTo: 'tests/**'
---

- ユニットテストは `tests/unit/` に `*.test.ts` として配置し、Vitest で実行する
- E2E テストは `tests/e2e/` に `*.spec.ts` として配置し、Playwright で実行する
- テストランナーコマンド: `pnpm test:unit`（ユニット）、`pnpm test:e2e`（E2E）、`pnpm test`（両方）
- ユニットテストは `@nuxt/test-utils` の Nuxt 環境で実行される
- E2E テストは dev サーバーを自動起動して実行される
