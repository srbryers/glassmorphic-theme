/**
 * Lightbox Island
 *
 * Full-screen image viewer with navigation.
 * Listens for 'modal:open' events with id 'image-zoom'.
 *
 * Hydration: client:idle (not critical path)
 */

interface LightboxImage {
  src: string
  alt: string
  thumbnail?: string
}

interface LightboxOpenDetail {
  id: string
  images: LightboxImage[]
  currentIndex: number
}

class LightboxIsland extends HTMLElement {
  private lightbox: HTMLElement | null = null
  private overlay: HTMLElement | null = null
  private image: HTMLImageElement | null = null
  private prevButton: HTMLButtonElement | null = null
  private nextButton: HTMLButtonElement | null = null
  private closeButton: HTMLButtonElement | null = null
  private currentSpan: HTMLElement | null = null
  private totalSpan: HTMLElement | null = null

  private images: LightboxImage[] = []
  private currentIndex = 0
  private isOpen = false
  private touchStartX = 0
  private touchEndX = 0

  connectedCallback() {
    console.log('[Island] lightbox hydrated (client:idle)')

    this.lightbox = this.querySelector('[data-lightbox]')
    this.overlay = this.querySelector('[data-lightbox-overlay]')
    this.image = this.querySelector('[data-lightbox-image]')
    this.prevButton = this.querySelector('[data-lightbox-prev]')
    this.nextButton = this.querySelector('[data-lightbox-next]')
    this.closeButton = this.querySelector('[data-lightbox-close]')
    this.currentSpan = this.querySelector('[data-lightbox-current]')
    this.totalSpan = this.querySelector('[data-lightbox-total]')

    this.setupEventListeners()
    this.setAttribute('data-hydrated', 'true')
  }

  private setupEventListeners() {
    // Listen for open events
    document.addEventListener('modal:open', ((e: CustomEvent<LightboxOpenDetail>) => {
      if (e.detail.id === 'image-zoom') {
        this.open(e.detail)
      }
    }) as EventListener)

    // Close button
    this.closeButton?.addEventListener('click', () => this.close())

    // Overlay click to close
    this.overlay?.addEventListener('click', () => this.close())

    // Navigation buttons
    this.prevButton?.addEventListener('click', () => this.prev())
    this.nextButton?.addEventListener('click', () => this.next())

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return

      switch (e.key) {
        case 'Escape':
          this.close()
          break
        case 'ArrowLeft':
          this.prev()
          break
        case 'ArrowRight':
          this.next()
          break
      }
    })

    // Touch/swipe support on the image wrapper
    const imageWrapper = this.image?.parentElement
    imageWrapper?.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX
    }, { passive: true })

    imageWrapper?.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].clientX
      this.handleSwipe()
    }, { passive: true })

    // Image load handler
    this.image?.addEventListener('load', () => {
      this.image?.classList.add('loaded')
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

  private open(detail: LightboxOpenDetail) {
    this.images = detail.images || []
    this.currentIndex = detail.currentIndex || 0

    if (this.images.length === 0) return

    this.isOpen = true
    this.updateImage()
    this.updateUI()

    // Show lightbox
    this.lightbox?.setAttribute('aria-hidden', 'false')

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    // Focus the close button for accessibility
    setTimeout(() => {
      this.closeButton?.focus()
    }, 100)
  }

  private close() {
    this.isOpen = false

    // Hide lightbox
    this.lightbox?.setAttribute('aria-hidden', 'true')

    // Restore body scroll
    document.body.style.overflow = ''

    // Remove loaded class for next open
    this.image?.classList.remove('loaded')

    // Dispatch close event
    document.dispatchEvent(new CustomEvent('modal:close', {
      detail: { id: 'image-zoom' }
    }))
  }

  private prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--
      this.updateImage()
      this.updateUI()
      this.dispatchChangeEvent()
    }
  }

  private next() {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++
      this.updateImage()
      this.updateUI()
      this.dispatchChangeEvent()
    }
  }

  private updateImage() {
    const currentImage = this.images[this.currentIndex]
    if (!currentImage || !this.image) return

    // Remove loaded class for transition
    this.image.classList.remove('loaded')

    // Use high-res version (append size parameter for Shopify CDN)
    const highResSrc = this.getHighResSrc(currentImage.src)
    this.image.src = highResSrc
    this.image.alt = currentImage.alt
  }

  private getHighResSrc(src: string): string {
    // If it's a Shopify CDN URL, request a larger size
    if (src.includes('cdn.shopify.com')) {
      // Replace any existing width parameter or add one
      const url = new URL(src)
      url.searchParams.set('width', '1600')
      return url.toString()
    }
    return src
  }

  private updateUI() {
    // Update counter
    if (this.currentSpan) {
      this.currentSpan.textContent = String(this.currentIndex + 1)
    }
    if (this.totalSpan) {
      this.totalSpan.textContent = String(this.images.length)
    }

    // Update button states
    if (this.prevButton) {
      this.prevButton.disabled = this.currentIndex === 0
    }
    if (this.nextButton) {
      this.nextButton.disabled = this.currentIndex === this.images.length - 1
    }
  }

  private dispatchChangeEvent() {
    document.dispatchEvent(new CustomEvent('lightbox:change', {
      detail: {
        index: this.currentIndex,
        image: this.images[this.currentIndex]
      }
    }))
  }
}

customElements.define('lightbox-island', LightboxIsland)
