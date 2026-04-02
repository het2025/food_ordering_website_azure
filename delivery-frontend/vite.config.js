import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['quickbite_logo.svg', 'delivery-boy.svg'],
      manifest: {
        name: 'QuickBite Delivery',
        short_name: 'QB Delivery',
        description: 'Manage deliveries and track orders with QuickBite',
        theme_color: '#3B82F6',
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
    port: 5176,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5003',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 5176,
    proxy: {
      '/api': {
        target: 'http://localhost:5003',
        changeOrigin: true
      }
    }
  }
});
