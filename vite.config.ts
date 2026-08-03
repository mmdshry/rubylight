import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const talaProxy = {
  '/api/tala': {
    target: 'https://www.tala.ir',
    changeOrigin: true,
    rewrite: () => '/banner',
    headers: {
      Accept: 'application/json, text/javascript, */*; q=0.01',
      Referer: 'https://www.tala.ir/',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
      Cookie: '_trc=1',
    },
  },
} as const

export default defineConfig({
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react-dom/client': 'preact/compat/client',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: { ...talaProxy },
  },
  preview: {
    proxy: { ...talaProxy },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: [
        'favicon.png',
        'brand/logo-hero.webp',
        'brand/logo-light-hero.webp',
        'brand/logo-icon.webp',
        'brand/logo-light-icon.webp',
        'brand/logo-icon.png',
        'brand/logo-light-icon.png',
        'brand/logo-sm.png',
        'brand/logo-light-sm.png',
        'brand/og.png',
        'fonts/**/*',
        'icons/**/*',
        'robots.txt',
        'sitemap.xml',
        'llms.txt',
      ],
      manifest: {
        name: 'Ruby Light Jewelry',
        short_name: 'Ruby Light',
        description: 'Ruby Light Jewelry — Tehran Grand Bazaar',
        theme_color: '#5C0A1A',
        background_color: '#5C0A1A',
        display: 'standalone',
        lang: 'fa',
        dir: 'rtl',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,webmanifest}',
          'brand/*.{webp,png}',
          'icons/*.png',
          'fonts/*.{woff2,woff}',
          'favicon.png',
          'llms.txt',
          'robots.txt',
          'sitemap.xml',
        ],
        globIgnores: [
          '**/card-*.png',
          '**/logo.svg',
          '**/assets/*vietnamese*',
          '**/assets/*cyrillic*',
          '**/assets/*greek*',
          '**/assets/*latin-ext*',
        ],
        runtimeCaching: [
          {
            urlPattern: /\/fonts\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ruby-fonts',
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /\/brand\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ruby-brand',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /\/assets\/.*\.(?:woff2?|ttf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ruby-webfonts',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
})
