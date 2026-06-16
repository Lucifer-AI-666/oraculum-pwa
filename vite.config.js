import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'CTF Oraculum v3',
        short_name: 'CTF Oracle',
        description: 'CTF Offensive Research - Real Tools + AI Assistant',
        theme_color: '#020100',
        background_color: '#020100',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.anthropic\.com\/.*/i,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'anthropic-api',
            }
          },
          {
            urlPattern: /^https:\/\/(dns\.google|ip-api\.com|crt\.sh)\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'external-apis',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 ore
              }
            }
          }
        ]
      }
    })
  ]
})
