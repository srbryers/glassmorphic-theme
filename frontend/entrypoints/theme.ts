/**
 * Beacon Basics Theme - Main Entry Point
 *
 * This file initializes the island architecture system
 * and loads critical components.
 */

import 'vite/modulepreload-polyfill'
import { IslandLoader } from '@/lib/island-loader'

// Initialize island loader when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    IslandLoader.init()
  })
} else {
  IslandLoader.init()
}

// Re-initialize on Shopify section load (Theme Editor support)
document.addEventListener('shopify:section:load', () => {
  IslandLoader.init()
})

// Global types
declare global {
  interface Window {
    Shopify: {
      designMode: boolean
      theme: {
        name: string
        role: string
      }
    }
  }
}

export {}
