import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { provideMainScroll, useMainScroll } from '~/composables/useMainScroll'

const Child = defineComponent({
  setup() {
    const { scrollToTop } = useMainScroll()
    return () => h('button', { onClick: () => scrollToTop('smooth') }, 'top')
  },
})

describe('useMainScroll', () => {
  it('provider が渡した scrollToTop を consumer が呼び出せる', async () => {
    const scrollToTop = vi.fn()
    const Parent = defineComponent({
      setup() {
        provideMainScroll({ scrollToTop })
        return () => h(Child)
      },
    })

    const wrapper = mount(Parent)
    await wrapper.find('button').trigger('click')

    expect(scrollToTop).toHaveBeenCalledWith('smooth')
  })

  it('provider が無い場合は警告し、window にフォールバックしない no-op を返す', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(Child)
    await expect(wrapper.find('button').trigger('click')).resolves.not.toThrow()

    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
