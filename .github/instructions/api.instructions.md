---
applyTo: 'server/**,app/composables/**/*.ts,app/types/index.ts'
---

- バックエンドは Django REST Framework + dynamic-rest（別リポジトリ `inuinouta`）
- Nuxt サーバー側で `/api/*` を `runtimeConfig.apiBaseUrl` に設定された Django API にプロキシしている
- フロントエンドからの API 呼び出しは常に `/api/` パスに対して行い、Django の URL を直接使わない
- API レスポンスは dynamic-rest 形式でリソース名をキーとする（例: `{ "songs": [...], "meta": {...} }`, `{ "song": {...} }`）
- 型定義は `app/types/index.ts` に集約する
- ページネーションパラメータ: `?page=1&per_page=20`
- レスポンスの `meta` にページネーション情報（`page`, `per_page`, `total_results`, `total_pages`）が含まれる
