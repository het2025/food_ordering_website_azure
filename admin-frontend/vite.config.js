import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['quickbite_logo.svg'],
      manifest: {
        name: 'QuickBite Admin',
        short_name: 'QB Admin',
        description: 'QuickBite admin dashboard — manage users, restaurants, and orders',
        theme_color: '#1E293B',
        background_color: '#0F172A',
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
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ['@mui/x-charts', 'd3-array', 'd3-scale', 'd3-format', 'd3-interpolate']
  },
  css: {
    postcss: './postcss.config.js'
  }
});
