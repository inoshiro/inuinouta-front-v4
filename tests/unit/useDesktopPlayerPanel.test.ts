import { describe, it, expect } from 'vitest'
import { useDesktopPlayerPanel } from '../../app/composables/useDesktopPlayerPanel'

describe('useDesktopPlayerPanel', () => {
  it('open() / close() / toggle() で isOpen が切り替わる', () => {
    const panel = useDesktopPlayerPanel()
    panel.close() // reset from any previous test (module-level singleton)

    expect(panel.isOpen.value).toBe(false)
    panel.open()
    expect(panel.isOpen.value).toBe(true)
    panel.close()
    expect(panel.isOpen.value).toBe(false)
    panel.toggle()
    expect(panel.isOpen.value).toBe(true)
  })

  it('複数の呼び出し元で状態を共有する', () => {
    const a = useDesktopPlayerPanel()
    const b = useDesktopPlayerPanel()
    a.close()

    a.open()
    expect(b.isOpen.value).toBe(true)
    b.close()
    expect(a.isOpen.value).toBe(false)
  })
})
