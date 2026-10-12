export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: { youtubeApiKey: '' },
  app: { head: { title: 'Frame — Thumbnail studio', meta: [{ name: 'description', content: 'Compare your thumbnails in realistic YouTube layouts and alongside live search results.' }] } },
})
