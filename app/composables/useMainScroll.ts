/**
 * Provides typed access to the layout-owned `<main>` scroll container so
 * pages can request scrolling back to top (e.g. after a pager change)
 * without reaching into layout DOM directly.
 */
export type ScrollBehaviorOption = 'auto' | 'smooth'

export interface MainScrollApi {
  scrollToTop: (behavior?: ScrollBehaviorOption) => void
}

const mainScrollKey: InjectionKey<MainScrollApi> = Symbol('main-scroll')

export function provideMainScroll(api: MainScrollApi) {
  provide(mainScrollKey, api)
}

export function useMainScroll(): MainScrollApi {
  const api = inject(mainScrollKey)
  if (!api) {
    console.warn(
      '[useMainScroll] provideMainScroll() が呼ばれていません（default.vue 配下でのみ使用できます）',
    )
    return { scrollToTop: () => {} }
  }
  return api
}
