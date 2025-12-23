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

  connectedCallback() {
    console.log('[Island] image-gallery hydrated (client:visible)')

    this.mainImage = this.querySelector('[data-main-image]')
    this.thumbnails = this.querySelectorAll('[data-thumbnail]')
    this.prevButton = this.querySelector('[data-prev]')
    this.nextButton = this.querySelector('[data-next]')

    this.loadImages()
    this.setupEventListeners()
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
    const currentImage = this.images[this.currentIndex]
    if (!currentImage) return

    // Dispatch zoom event for modal or lightbox
    document.dispatchEvent(
      new CustomEvent('modal:open', {
        detail: {
          id: 'image-zoom',
          image: currentImage
        }
      })
    )
  }
}

customElements.define('image-gallery', ImageGallery)
