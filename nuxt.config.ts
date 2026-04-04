import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  ssr: true,

  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
    },
  },

  css: ['~/assets/css/main.css', '@fortawesome/fontawesome-svg-core/styles.css'],

  build: {
    transpile: [
      '@fortawesome/fontawesome-svg-core',
      '@fortawesome/free-solid-svg-icons',
      '@fortawesome/free-brands-svg-icons',
      '@fortawesome/vue-fontawesome',
    ],
  },

  modules: ['@nuxtjs/google-fonts', '@nuxt/eslint', '@pinia/nuxt'],

  googleFonts: {
    families: {
      'Noto Sans JP': [400, 500, 700],
    },
    display: 'swap',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  runtimeConfig: {
    apiBaseUrl: 'http://localhost:8000/api',
  },
})
