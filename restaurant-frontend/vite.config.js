import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['quickbite_logo.svg'],
      manifest: {
        name: 'QuickBite Restaurant',
        short_name: 'QB Restaurant',
        description: 'Manage your restaurant, menu, and orders on QuickBite',
        theme_color: '#10B981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'quickbite_logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html'
      }
    })
  ],
  server: {
    host: true,
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5004',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: true,
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5004',
        changeOrigin: true
      }
    }
  }
})
