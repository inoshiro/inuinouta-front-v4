export default defineNuxtPlugin((nuxtApp) => {
  // app:mounted fires as soon as vueApp.mount() returns, which can be BEFORE Nuxt's
  // async layout/page (Suspense) content finishes hydrating. Loading here raced with
  // that hydration and left the DOM stuck on the SSR (unfavorited) state.
  // app:suspense:resolve fires only after nuxtApp.isHydrating becomes false, i.e.
  // after all deferred hydration (including layouts/pages) has completed.
  nuxtApp.hook('app:suspense:resolve', () => {
    usePlaylistsStore().loadFromStorage()
  })
})
