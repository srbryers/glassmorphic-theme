/**
 * Image Gallery Island
 *
 * Product image gallery with thumbnails and zoom.
 * Supports swipe gestures on mobile.
 *
 * Hydration: client:visible (loads when scrolled into view)
 */

interface GalleryImage {
  src: string
  alt: string
  thumbnail?: string
}

class ImageGallery extends HTMLElement {
  private mainImage: HTMLImageElement | null = null
  private thumbnails: NodeListOf<HTMLElement> | null = null
  private prevButton: HTMLElement | null = null
  private nextButton: HTMLElement | null = null
  private images: GalleryImage[] = []
  private currentIndex = 0
  private touchStartX = 0
  private touchEndX = 0

  // Zoom elements
  private wrapper: HTMLElement | null = null
  private imageContainer: HTMLElement | null = null
  private zoomLens: HTMLElement | null = null
  private zoomResult: HTMLElement | null = null
  private isZoomEnabled = false
  private isOverNavigation = false

  connectedCallback() {
    console.log('[Island] image-gallery hydrated (client:visible)')

    this.mainImage = this.querySelector('[data-main-image]')
    this.thumbnails = this.querySelectorAll('[data-thumbnail]')
    this.prevButton = this.querySelector('[data-prev]')
    this.nextButton = this.querySelector('[data-next]')

    // Zoom elements (wrapper is the parent island container)
    this.wrapper = this.closest('[data-island="image-gallery"]')
    this.imageContainer = this.querySelector('[data-image-container]')
    this.zoomLens = this.querySelector('[data-zoom-lens]')
    this.zoomResult = this.wrapper?.querySelector('[data-zoom-result]') || null

    this.loadImages()
    this.setupEventListeners()
    this.initZoom()
    this.updateUI()

    this.setAttribute('data-hydrated', 'true')
  }

  private loadImages() {
    this.thumbnails?.forEach((thumb, index) => {
      const img = thumb.querySelector('img')
      if (img) {
        this.images.push({
          src: thumb.dataset.fullSrc || img.src,
          alt: img.alt,
          thumbnail: img.src
        })
      }
    })

    // Check URL for initial image
    const params = new URLSearchParams(window.location.search)
    const imageIndex = parseInt(params.get('image') || '0')
    if (imageIndex >= 0 && imageIndex < this.images.length) {
      this.currentIndex = imageIndex
    }
  }

  private setupEventListeners() {
    // Thumbnail clicks
    this.thumbnails?.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        this.goTo(index)
      })

      // Keyboard support
      thumb.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
          e.preventDefault()
          this.goTo(index)
        }
      })
    })

    // Navigation buttons
    this.prevButton?.addEventListener('click', () => this.prev())
    this.nextButton?.addEventListener('click', () => this.next())

    // Touch/swipe support
    this.mainImage?.parentElement?.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX
    }, { passive: true })

    this.mainImage?.parentElement?.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].clientX
      this.handleSwipe()
    }, { passive: true })

    // Keyboard navigation
    this.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prev()
      } else if (e.key === 'ArrowRight') {
        this.next()
      }
    })

    // Listen for variant image changes
    document.addEventListener('variant:image-change', ((e: CustomEvent) => {
      this.handleVariantChange(e.detail)
    }) as EventListener)

    // Listen for lightbox navigation to sync gallery
    document.addEventListener('lightbox:change', ((e: CustomEvent) => {
      if (e.detail.index !== undefined) {
        this.goTo(e.detail.index)
      }
    }) as EventListener)

    // Main image click (zoom)
    this.mainImage?.addEventListener('click', () => {
      this.openZoom()
    })
  }

  private handleSwipe() {
    const swipeThreshold = 50
    const diff = this.touchStartX - this.touchEndX

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.next()
      } else {
        this.prev()
      }
    }
  }

  private handleVariantChange(detail: { src: string; alt: string }) {
    // Find matching image or add new one
    const index = this.images.findIndex((img) => img.src === detail.src)

    if (index >= 0) {
      this.goTo(index)
    } else if (this.mainImage) {
      // Update main image directly
      this.mainImage.src = detail.src
      this.mainImage.alt = detail.alt
    }
  }

  private goTo(index: number) {
    if (index < 0 || index >= this.images.length) return
    if (index === this.currentIndex) return

    this.currentIndex = index
    this.updateUI()

    // Dispatch event
    this.dispatchEvent(
      new CustomEvent('gallery:change', {
        bubbles: true,
        detail: { index, image: this.images[index] }
      })
    )
  }

  private prev() {
    const newIndex = this.currentIndex > 0
      ? this.currentIndex - 1
      : this.images.length - 1
    this.goTo(newIndex)
  }

  private next() {
    const newIndex = this.currentIndex < this.images.length - 1
      ? this.currentIndex + 1
      : 0
    this.goTo(newIndex)
  }

  private updateUI() {
    const currentImage = this.images[this.currentIndex]
    if (!currentImage) return

    // Update main image with fade transition
    if (this.mainImage) {
      this.mainImage.classList.add('opacity-0')

      setTimeout(() => {
        if (this.mainImage) {
          this.mainImage.src = currentImage.src
          this.mainImage.alt = currentImage.alt
          this.mainImage.classList.remove('opacity-0')

          // Update zoom background when image changes
          this.updateZoomBackground()
        }
      }, 150)
    }

    // Update thumbnail selection
    this.thumbnails?.forEach((thumb, index) => {
      const isActive = index === this.currentIndex
      thumb.classList.toggle('ring-2', isActive)
      thumb.classList.toggle('ring-[var(--primary)]', isActive)
      thumb.setAttribute('aria-selected', isActive.toString())
    })

    // Update navigation button states
    this.prevButton?.classList.toggle('opacity-50', this.currentIndex === 0)
    this.nextButton?.classList.toggle('opacity-50', this.currentIndex === this.images.length - 1)
  }

  private openZoom() {
    if (this.images.length === 0) return

    // Dispatch zoom event for lightbox with all images
    document.dispatchEvent(
      new CustomEvent('modal:open', {
        detail: {
          id: 'image-zoom',
          images: this.images,
          currentIndex: this.currentIndex
        }
      })
    )
  }

  // Magnifying glass zoom methods
  private initZoom() {
    // Only enable zoom on desktop (lg breakpoint = 1024px)
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    this.isZoomEnabled = mediaQuery.matches

    mediaQuery.addEventListener('change', (e) => {
      this.isZoomEnabled = e.matches
      if (!e.matches) {
        this.hideZoom()
      }
    })

    if (!this.imageContainer || !this.zoomLens || !this.zoomResult) return

    // Mouse events for zoom
    this.imageContainer.addEventListener('mouseenter', () => this.showZoom())
    this.imageContainer.addEventListener('mouseleave', () => this.hideZoom())
    this.imageContainer.addEventListener('mousemove', (e) => this.handleZoomMove(e))

    // Hide zoom when hovering over navigation buttons
    this.prevButton?.addEventListener('mouseenter', () => {
      this.isOverNavigation = true
      this.hideZoom()
    })
    this.nextButton?.addEventListener('mouseenter', () => {
      this.isOverNavigation = true
      this.hideZoom()
    })
    this.prevButton?.addEventListener('mouseleave', () => {
      this.isOverNavigation = false
      this.showZoom()
    })
    this.nextButton?.addEventListener('mouseleave', () => {
      this.isOverNavigation = false
      this.showZoom()
    })

    // Set initial zoom background
    this.updateZoomBackground()
  }

  private showZoom() {
    if (!this.isZoomEnabled || !this.wrapper || this.isOverNavigation) return
    this.wrapper.classList.add('zoom-active')
  }

  private hideZoom() {
    if (!this.wrapper) return
    this.wrapper.classList.remove('zoom-active')
  }

  private handleZoomMove(e: MouseEvent) {
    if (!this.isZoomEnabled || !this.imageContainer || !this.zoomLens || !this.zoomResult || this.isOverNavigation) return

    const rect = this.imageContainer.getBoundingClientRect()

    // Calculate mouse position as percentage (0-100)
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    // Clamp values to prevent lens from going outside image
    const clampedX = Math.max(0, Math.min(100, x))
    const clampedY = Math.max(0, Math.min(100, y))

    // Position the lens indicator
    this.zoomLens.style.left = `${clampedX}%`
    this.zoomLens.style.top = `${clampedY}%`

    // Set background position on zoom result
    this.zoomResult.style.backgroundPosition = `${clampedX}% ${clampedY}%`
  }

  private updateZoomBackground() {
    if (!this.zoomResult || !this.mainImage) return

    // Use the current main image as the zoom background
    this.zoomResult.style.backgroundImage = `url('${this.mainImage.src}')`
  }
}

customElements.define('image-gallery', ImageGallery)
