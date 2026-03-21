# Composable パターン

## 一覧用（`useXxxs.ts`）

```typescript
import type { XxxsResponse } from '~/types'

export function useXxxs(options?: { perPage?: number }) {
  const { useApiFetch } = useApi()
  const page = ref(1)
  const perPage = options?.perPage ?? 30
  const search = ref('')

  const query = computed(() => {
    const params = new URLSearchParams()
    params.set('per_page', String(perPage))
    params.set('page', String(page.value))
    if (search.value) {
      params.set('filter{name.icontains}', search.value)
    }
    return `/api/xxxs/?${params.toString()}`
  })

  const { data: raw, status, error, refresh } = useApiFetch<XxxsResponse>(query)

  const xxxs = computed(() => raw.value?.xxxs ?? [])
  const meta = computed(() => raw.value?.meta)

  return { xxxs, meta, page, search, status, error, refresh }
}
```

### ポイント

- `useApiFetch` はリアクティブ URL を受け取る（`query` が変わると自動再取得）
- フィルタキーは Django 側の定義に合わせる（`filter{field.icontains}` 等）
- 返り値: `{ xxxs, meta, page, search, status, error, refresh }`（リソース名の複数形をキーにする）

## 詳細用（`useXxx.ts`）

```typescript
import type { XxxResponse, Xxx } from '~/types'

export function useXxx(id: Ref<string | number> | string | number) {
  const { useApiFetch } = useApi()
  const path = computed(() => `/api/xxxs/${unref(id)}/`)

  const { data: raw, status, error } = useApiFetch<XxxResponse>(path)

  const xxx = computed<Xxx | null>(() => raw.value?.xxx ?? null)

  return { xxx, status, error }
}
```

### ポイント

- `id` は `Ref` またはプリミティブのどちらも受け付ける（`unref` で統一）
- 返り値: `{ xxx, status, error }`（リソース名の単数形をキーにする。ページネーション不要）
