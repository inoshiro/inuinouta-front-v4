import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: { enabled: true },

  ssr: true,

  app: {
    head: {
      htmlAttrs: { lang: 'ja' },
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      titleTemplate: '%s | いぬいのうた',
      meta: [
        {
          name: 'description',
          content:
            'いぬいのうたは、にじさんじ所属のバーチャルライバーである戌亥とこさんを応援するファンサイトです。戌亥とこさんが歌った楽曲を探しやすく、再生しやすいようにまとめています。',
        },
        {
          name: 'keywords',
          content:
            '戌亥とこ,ケルベロス,にじさんじ,歌,歌ってみた,バーチャルYouTuber,Vtuber,いぬいのうた,YouTube',
        },
        { property: 'og:site_name', content: 'いぬいのうた' },
        { property: 'og:type', content: 'website' },
        {
          property: 'og:image',
          content: 'https://uta.inui-dondon-sukininaru.net/og-image.png',
        },
        { name: 'twitter:card', content: 'summary' },
        {
          name: 'twitter:image',
          content: 'https://uta.inui-dondon-sukininaru.net/og-image.png',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
      ],
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
    public: {
      // Override via NUXT_PUBLIC_SITE_URL environment variable
      siteUrl: 'https://uta.inui-dondon-sukininaru.net',
    },
  },
})
