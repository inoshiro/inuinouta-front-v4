# 型定義パターン

`app/types/index.ts` に追記する。

## Basic 型（埋め込み用の最小フィールド）

```typescript
export interface XxxBasic {
  id: number
  name: string
  // resource-specific fields
}
```

## 拡張型（一覧用 / 詳細用）

```typescript
// 一覧用: 関連リソースの件数のみ
export interface XxxList extends XxxBasic {
  songs_count: number
}

// 詳細用: 関連リソースを配列で埋め込み
export interface XxxDetail extends XxxBasic {
  songs: SongBasic[]
}

// 関連リソースを埋め込む場合
export interface Xxx extends XxxBasic {
  video: VideoBasic
}
```

一覧・詳細で返るフィールドが同じ場合は `XxxList` / `XxxDetail` の分離は不要。

## Response ラッパー（dynamic-rest 形式）

```typescript
// 一覧（複数形キー + meta）
export interface XxxsResponse {
  xxxs: Xxx[] // リソース名の複数形
  meta?: PaginationMeta
}

// 詳細（単数形キー）
export interface XxxResponse {
  xxx: Xxx // リソース名の単数形
}
```

`PaginationMeta` は既に定義済み。再定義しない。
