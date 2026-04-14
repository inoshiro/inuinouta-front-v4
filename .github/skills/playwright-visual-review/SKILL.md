---
name: playwright-visual-review
description: Playwright MCP を使ってブラウザを起動し、実際の画面スクリーンショットを根拠にした UI/UX レビューを行う際の標準手順。UX Review・UI Review v2 エージェントが読み込む。
---

# Playwright Visual Review

コードの静的解析だけでなく、Playwright MCP を使って実際のブラウザで UI を確認し、視覚的根拠をレビューに含める手順。

## Step 1: 開発サーバーの起動確認

レビュー開始前に、Nuxt 開発サーバーが `http://localhost:3000` で動いているかをユーザーに確認する。

```
まず開発サーバーの起動状況を確認させてください。
- Django API（http://localhost:8000）も必要な画面をレビューする場合は `pnpm dev:all`
- Nuxt アプリ単体で確認できる場合は `pnpm dev`
どちらで起動しますか？（すでに起動済みであればそのまま進みます）
```

ユーザーが起動を依頼した場合、ターミナルでバックグラウンド実行する:

```bash
# Nuxt のみ
pnpm dev

# Nuxt + Django API 両方
pnpm dev:all
```

起動後、`http://localhost:3000` にアクセスできることを `mcp_playwright_browser_navigate` で確認してから次のステップへ進む。

## Step 2: 対象ページへの基本ナビゲーション

```
// 対象ページに移動
mcp_playwright_browser_navigate({ url: "http://localhost:3000/{path}" })

// デスクトップサイズ（デフォルト）でスクリーンショット
mcp_playwright_browser_take_screenshot({ type: "png" })
```

## Step 3: モバイルレイアウト確認

```
// モバイルビューポートに切り替え
mcp_playwright_browser_resize({ width: 390, height: 844 })
mcp_playwright_browser_take_screenshot({ type: "png" })

// デスクトップに戻す
mcp_playwright_browser_resize({ width: 1280, height: 800 })
```

## Step 4: インタラクション状態の確認

### ホバー状態

```
// CSS セレクタで要素をホバー
mcp_playwright_browser_hover({ selector: "button.target-element" })
mcp_playwright_browser_take_screenshot({ type: "png" })
```

### 計算済みスタイルの検証（色・サイズ）

```
mcp_playwright_browser_evaluate({
  function: () => {
    const el = document.querySelector('.target-element')
    const style = window.getComputedStyle(el)
    return {
      color: style.color,
      backgroundColor: style.backgroundColor,
      fontSize: style.fontSize,
    }
  }
})
```

### アクセシビリティツリーの確認（セマンティクス）

```
mcp_playwright_browser_snapshot()
```

## Step 5: 状態変化の確認（空・ローディング・エラー）

- データが空の場合: URL パラメータや API モックで空状態を再現してスクリーンショット
- ローディング中: ページリロード直後のキャプチャ（ネットワーク速度前提で困難なら静的解析で補完）

## Step 5.5: 主要導線の確認

- 最低でも 1 つは主要 CTA または主要導線を操作し、操作前後の状態を確認する
- overlay / drawer / modal がある場合は、開閉後のスクリーンショットを残す
- モバイル幅で CTA が隠れる、テキストが切れる、固定要素が操作を邪魔する場合は fail 寄りの finding として扱う

## Step 6: 片付け

レビュー後にブラウザを閉じる必要はない（MCP セッションが維持される）。
次のレビューでは同じブラウザセッションを再利用できる。

## スクリーンショットのレポートへの組み込み方

各 Finding には以下を付記する:

```
**視覚的根拠**: [スクリーンショット取得済み]
- デスクトップ幅 (1280px): 〇〇の状態を確認
- モバイル幅 (390px): △△の問題を確認
```

静的コード解析のみで確認した項目は:

```
**確認方法**: 静的コード解析（ブラウザ未確認）
```

と明示する。

## Verdict の付け方

最終レポートでは `Pass` または `Fail` を明示する。

- **Fail**: 主要導線が途切れる、主要 CTA が分かりにくい、モバイルで崩れる、overlay / drawer / modal で破綻する
- **Pass**: blocking issue はなく、改善余地があっても主要導線は成立している

## 注意事項

- `mcp_playwright_browser_take_screenshot` の `type` パラメータは必須（`"png"` を指定）
- フォントが □ になる場合は OS レベルの日本語フォント未インストール → `sudo apt install -y fonts-noto-cjk` で解決
- ブラウザ再起動後にフォントキャッシュが更新される
