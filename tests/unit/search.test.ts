import { describe, it, expect } from 'vitest'
import { normalizeSearch } from '../../app/utils/search'

describe('normalizeSearch', () => {
  it('カタカナをひらがなに変換する', () => {
    expect(normalizeSearch('スイカ')).toBe('すいか')
  })

  it('大文字を小文字に変換する', () => {
    expect(normalizeSearch('YOASOBI')).toBe('yoasobi')
  })

  it('ひらがなはそのまま', () => {
    expect(normalizeSearch('すいか')).toBe('すいか')
  })

  it('カタカナ・大文字を同時に正規化する', () => {
    expect(normalizeSearch('ピアノCover')).toBe('ぴあのcover')
  })

  it('空文字はそのまま空文字を返す', () => {
    expect(normalizeSearch('')).toBe('')
  })

  it('ひらがなクエリとカタカナタイトルを相互に一致できる', () => {
    const q = normalizeSearch('すいか')
    const title = normalizeSearch('スイカの歌')
    expect(title.includes(q)).toBe(true)
  })

  it('カタカナクエリとひらがなタイトルを相互に一致できる', () => {
    const q = normalizeSearch('スイカ')
    const title = normalizeSearch('すいかの歌')
    expect(title.includes(q)).toBe(true)
  })
})
