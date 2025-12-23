import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    shopify(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend')
    }
  },
  build: {
    emptyOutDir: false,
    rollupOptions: {
      output: {
        // Code splitting for islands
        manualChunks: (id) => {
          if (id.includes('frontend/islands/')) {
            const name = id.split('frontend/islands/')[1]?.split('.')[0]
            return `island-${name}`
          }
        }
      }
    }
  }
})
