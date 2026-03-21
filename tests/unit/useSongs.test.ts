import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import type { Ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// useFetch を差し替えて、渡された URL（ComputedRef）を外部から参照できるようにする
let capturedUrlRef: Ref<string>

mockNuxtImport('useFetch', () => {
  return (url: Ref<string>) => {
    capturedUrlRef = url
    return {
      data: ref(null),
      status: ref('idle'),
      error: ref(null),
      refresh: vi.fn(),
    }
  }
})

describe('useSongs', () => {
  it('リクエスト URL に投稿日降順の sort パラメータ (sort[]=-video.published_at) が含まれる', () => {
    useSongs()
    expect(decodeURIComponent(capturedUrlRef.value)).toContain('sort[]=-video.published_at')
  })

  it('ページや検索キーワードが変わっても sort パラメータが維持される', () => {
    const { page, search } = useSongs()
    page.value = 2
    search.value = 'テスト曲'

    const url = decodeURIComponent(capturedUrlRef.value)
    expect(url).toContain('sort[]=-video.published_at')
    expect(url).toContain('page=2')
    expect(url).toContain('テスト曲')
  })
})
