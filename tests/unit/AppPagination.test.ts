import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppPagination from '~/components/AppPagination.vue'

// totalPages = Math.ceil(totalItems / itemsPerPage)

describe('AppPagination', () => {
  describe('表示制御', () => {
    it('totalItems が itemsPerPage 以下（1 ページ）のとき何も表示しない', () => {
      const wrapper = mount(AppPagination, {
        props: { totalItems: 10, itemsPerPage: 10, currentPage: 1 },
      })
      expect(wrapper.find('div').exists()).toBe(false)
    })

    it('totalPages > 1 のときページネーションを表示する', () => {
      const wrapper = mount(AppPagination, {
        props: { totalItems: 30, itemsPerPage: 10, currentPage: 1 },
      })
      expect(wrapper.find('div').exists()).toBe(true)
    })

    it('totalItems が 0 のとき何も表示しない', () => {
      const wrapper = mount(AppPagination, {
        props: { totalItems: 0, itemsPerPage: 10, currentPage: 1 },
      })
      expect(wrapper.find('div').exists()).toBe(false)
    })
  })

  describe('「前へ」ボタン', () => {
    it('currentPage が 1 のとき disabled になる', () => {
      const wrapper = mount(AppPagination, {
        props: { totalItems: 30, itemsPerPage: 10, currentPage: 1 },
      })
      const prevBtn = wrapper.findAll('button')[0]
      expect(prevBtn.attributes('disabled')).toBeDefined()
    })

    it('currentPage が 2 以上のとき disabled でない', () => {
      const wrapper = mount(AppPagination, {
        props: { totalItems: 30, itemsPerPage: 10, currentPage: 2 },
      })
      const prevBtn = wrapper.findAll('button')[0]
      expect(prevBtn.attributes('disabled')).toBeUndefined()
    })

    it('クリックで update:page イベントに currentPage - 1 を emit する', async () => {
      const wrapper = mount(AppPagination, {
        props: { totalItems: 30, itemsPerPage: 10, currentPage: 2 },
      })
      await wrapper.findAll('button')[0].trigger('click')
      expect(wrapper.emitted('update:page')).toEqual([[1]])
    })
  })

  describe('「次へ」ボタン', () => {
    it('currentPage が最終ページのとき disabled になる', () => {
      const wrapper = mount(AppPagination, {
        props: { totalItems: 30, itemsPerPage: 10, currentPage: 3 },
      })
      const buttons = wrapper.findAll('button')
      const nextBtn = buttons[buttons.length - 1]
      expect(nextBtn.attributes('disabled')).toBeDefined()
    })

    it('currentPage が最終ページでないとき disabled でない', () => {
      const wrapper = mount(AppPagination, {
        props: { totalItems: 30, itemsPerPage: 10, currentPage: 1 },
      })
      const buttons = wrapper.findAll('button')
      const nextBtn = buttons[buttons.length - 1]
      expect(nextBtn.attributes('disabled')).toBeUndefined()
    })

    it('クリックで update:page イベントに currentPage + 1 を emit する', async () => {
      const wrapper = mount(AppPagination, {
        props: { totalItems: 30, itemsPerPage: 10, currentPage: 1 },
      })
      const buttons = wrapper.findAll('button')
      await buttons[buttons.length - 1].trigger('click')
      expect(wrapper.emitted('update:page')).toEqual([[2]])
    })
  })

  describe('ページ番号ボタン', () => {
    it('7 ページ以下のとき全ページ番号を表示する', () => {
      const wrapper = mount(AppPagination, {
        props: { totalItems: 70, itemsPerPage: 10, currentPage: 1 },
      })
      // ページ番号ボタン（「前へ」「次へ」を除く）
      const pageButtons = wrapper.findAll('button').filter((b) => /^\d+$/.test(b.text()))
      expect(pageButtons).toHaveLength(7)
    })

    it('ページ番号ボタンをクリックすると該当ページを emit する', async () => {
      const wrapper = mount(AppPagination, {
        props: { totalItems: 30, itemsPerPage: 10, currentPage: 1 },
      })
      // 「2」ボタン
      const pageButtons = wrapper.findAll('button').filter((b) => /^\d+$/.test(b.text()))
      await pageButtons[1].trigger('click') // 2 ページ目
      expect(wrapper.emitted('update:page')).toEqual([[2]])
    })
  })
})
