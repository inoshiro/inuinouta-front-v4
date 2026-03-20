import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  ssr: true,

  css: ['~/assets/css/main.css'],

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
