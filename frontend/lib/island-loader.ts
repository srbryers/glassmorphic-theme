/**
 * Island Loader - Core Hydration System
 *
 * Implements Astro-inspired island architecture for Shopify themes.
 * Islands hydrate independently based on their strategy:
 * - load: Hydrate immediately (critical interactivity)
 * - idle: Hydrate when browser is idle
 * - visible: Hydrate when scrolled into view
 * - media: Hydrate on matching media query
 */

type HydrationStrategy = 'load' | 'idle' | 'visible' | 'media'

interface IslandElement extends HTMLElement {
  dataset: {
    island: string
    hydrate: HydrationStrategy
    media?: string
  }
}

// Track which islands have been hydrated to prevent double-loading
const hydratedIslands = new WeakSet<Element>()

// IntersectionObserver for visible strategy
let visibilityObserver: IntersectionObserver | null = null

/**
 * Dynamically import and hydrate an island component
 */
async function hydrateIsland(island: IslandElement): Promise<void> {
  if (hydratedIslands.has(island)) return

  const name = island.dataset.island
  if (!name) return

  try {
    // Dynamic import - Vite will code-split each island
    await import(`../islands/${name}.ts`)
    hydratedIslands.add(island)
    island.setAttribute('data-hydrated', 'true')
  } catch (error) {
    console.warn(`[Island] Failed to load island "${name}":`, error)
  }
}

/**
 * Set up IntersectionObserver for visible strategy
 */
function getVisibilityObserver(): IntersectionObserver {
  if (!visibilityObserver) {
    visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const island = entry.target as IslandElement
            hydrateIsland(island)
            visibilityObserver?.unobserve(island)
          }
        })
      },
      {
        rootMargin: '50px', // Start loading slightly before visible
      }
    )
  }
  return visibilityObserver
}

/**
 * Process a single island based on its hydration strategy
 */
function processIsland(island: IslandElement): void {
  if (hydratedIslands.has(island)) return

  const strategy = island.dataset.hydrate || 'visible'

  switch (strategy) {
    case 'load':
      // Hydrate immediately
      hydrateIsland(island)
      break

    case 'idle':
      // Hydrate when browser is idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => hydrateIsland(island), { timeout: 2000 })
      } else {
        // Fallback for Safari
        setTimeout(() => hydrateIsland(island), 200)
      }
      break

    case 'visible':
      // Hydrate when scrolled into view
      getVisibilityObserver().observe(island)
      break

    case 'media':
      // Hydrate on matching media query
      const mediaQuery = island.dataset.media
      if (mediaQuery) {
        const mql = window.matchMedia(mediaQuery)
        if (mql.matches) {
          hydrateIsland(island)
        } else {
          mql.addEventListener('change', (e) => {
            if (e.matches) hydrateIsland(island)
          }, { once: true })
        }
      }
      break
  }
}

/**
 * Initialize the island loader
 * Scans the DOM for [data-island] elements and sets up hydration
 */
function init(): void {
  const islands = document.querySelectorAll<IslandElement>('[data-island]')
  islands.forEach(processIsland)
}

export const IslandLoader = {
  init,
  hydrateIsland,
}
