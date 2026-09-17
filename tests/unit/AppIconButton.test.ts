import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppIconButton from '~/components/AppIconButton.vue'

describe('AppIconButton', () => {
  it('pressed を指定しない場合は aria-pressed 属性を持たない', () => {
    const wrapper = mount(AppIconButton)
    expect(wrapper.attributes('aria-pressed')).toBeUndefined()
  })

  it('pressed=true のとき aria-pressed="true" と選択トークンの色を持つ', () => {
    const wrapper = mount(AppIconButton, { props: { pressed: true } })
    expect(wrapper.attributes('aria-pressed')).toBe('true')
    expect(wrapper.classes()).toContain('text-selected-text')
  })

  it('pressed=false のとき aria-pressed="false" と非選択色を持つ', () => {
    const wrapper = mount(AppIconButton, { props: { pressed: false } })
    expect(wrapper.attributes('aria-pressed')).toBe('false')
    expect(wrapper.classes()).toContain('text-gray-400')
  })

  it('disabled のとき disabled 属性を持つ', () => {
    const wrapper = mount(AppIconButton, { props: { disabled: true } })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })

  it('size=sm のとき小さいパディングクラスを持つ', () => {
    const wrapper = mount(AppIconButton, { props: { size: 'sm' } })
    expect(wrapper.classes()).toContain('p-1.5')
  })

  it('クリックイベントが親へ伝播する', async () => {
    const wrapper = mount(AppIconButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})
