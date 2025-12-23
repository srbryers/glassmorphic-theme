/**
 * Quick View Island
 *
 * Modal for viewing product details without leaving the page.
 * Fetches product data via Shopify's product.json endpoint.
 * Hydration: client:idle
 */

import { cartStore } from '../lib/cart-store'

interface ProductVariant {
  id: number
  title: string
  available: boolean
  price: number
  compare_at_price: number | null
  option1: string | null
  option2: string | null
  option3: string | null
  featured_image: { src: string } | null
}

interface ProductOption {
  name: string
  position: number
  values: string[]
}

interface ProductData {
  id: number
  title: string
  handle: string
  description: string
  vendor: string
  type: string
  images: string[]
  options: ProductOption[]
  variants: ProductVariant[]
}

class QuickView extends HTMLElement {
  private modal: HTMLElement | null = null
  private backdrop: HTMLElement | null = null
  private content: HTMLElement | null = null
  private closeButton: HTMLButtonElement | null = null
  private productData: ProductData | null = null
  private selectedVariant: ProductVariant | null = null
  private quantity = 1
  private previousFocus: HTMLElement | null = null

  connectedCallback() {
    console.log('[Island] quick-view hydrated (client:idle)')

    this.modal = this.querySelector('[data-modal]')
    this.backdrop = this.querySelector('[data-backdrop]')
    this.content = this.querySelector('[data-content]')
    this.closeButton = this.querySelector('[data-close]')

    this.setupEventListeners()
    this.listenForTriggers()
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeydown)
  }

  private setupEventListeners(): void {
    // Close button
    this.closeButton?.addEventListener('click', () => this.close())

    // Backdrop click
    this.backdrop?.addEventListener('click', () => this.close())

    // Escape key
    document.addEventListener('keydown', this.handleKeydown)
  }

  private handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape' && this.isOpen()) {
      this.close()
    }
  }

  private listenForTriggers(): void {
    // Listen for quick view trigger events
    document.addEventListener('quick-view:open', ((e: CustomEvent) => {
      const { productHandle } = e.detail
      if (productHandle) {
        this.open(productHandle)
      }
    }) as EventListener)
  }

  private isOpen(): boolean {
    return this.modal?.classList.contains('open') ?? false
  }

  async open(productHandle: string): Promise<void> {
    if (!this.modal || !this.content) return

    // Store previous focus
    this.previousFocus = document.activeElement as HTMLElement

    // Show modal with loading state
    this.modal.classList.add('open')
    this.modal.setAttribute('aria-hidden', 'false')
    document.body.style.overflow = 'hidden'

    // Show loading
    this.content.innerHTML = this.renderLoading()

    try {
      // Fetch product data
      const response = await fetch(`/products/${productHandle}.json`)
      if (!response.ok) throw new Error('Failed to fetch product')

      const data = await response.json()
      this.productData = data.product
      this.selectedVariant = this.productData?.variants[0] || null
      this.quantity = 1

      // Render product
      this.content.innerHTML = this.renderProduct()
      this.setupProductInteractions()

      // Focus first interactive element
      const firstFocusable = this.content.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
    } catch (error) {
      console.error('Quick view error:', error)
      this.content.innerHTML = this.renderError()
    }
  }

  close(): void {
    if (!this.modal) return

    this.modal.classList.remove('open')
    this.modal.setAttribute('aria-hidden', 'true')
    document.body.style.overflow = ''

    // Restore focus
    this.previousFocus?.focus()

    // Dispatch close event
    this.dispatchEvent(new CustomEvent('quick-view:closed', { bubbles: true }))
  }

  private renderLoading(): string {
    return `
      <div class="quick-view__loading">
        <div class="quick-view__spinner"></div>
        <p>Loading product...</p>
      </div>
    `
  }

  private renderError(): string {
    return `
      <div class="quick-view__error">
        <svg class="w-12 h-12 text-[var(--destructive)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
        <p class="mt-4 text-lg font-medium">Failed to load product</p>
        <button type="button" class="btn btn-secondary mt-4" data-close>Close</button>
      </div>
    `
  }

  private renderProduct(): string {
    if (!this.productData) return ''

    const product = this.productData
    const variant = this.selectedVariant
    const mainImage = product.images[0] || ''
    const hasMultipleVariants = product.variants.length > 1

    return `
      <div class="quick-view__grid">
        <!-- Image -->
        <div class="quick-view__image">
          <img
            src="${mainImage}"
            alt="${product.title}"
            class="w-full h-full object-cover rounded-xl"
            data-main-image
          />
        </div>

        <!-- Details -->
        <div class="quick-view__details">
          <h2 class="text-2xl font-bold mb-2">${product.title}</h2>

          ${product.vendor ? `<p class="text-sm text-[var(--muted-foreground)] mb-4">${product.vendor}</p>` : ''}

          <!-- Price -->
          <div class="quick-view__price mb-6" data-price>
            ${this.renderPrice(variant)}
          </div>

          <!-- Options -->
          ${hasMultipleVariants ? this.renderOptions() : ''}

          <!-- Quantity -->
          <div class="quick-view__quantity mb-6">
            <label class="block text-sm font-medium mb-2">Quantity</label>
            <div class="quantity-selector">
              <button type="button" class="quantity-selector__button" data-decrease aria-label="Decrease quantity">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                </svg>
              </button>
              <input
                type="number"
                class="quantity-selector__input"
                value="${this.quantity}"
                min="1"
                max="99"
                data-quantity
                aria-label="Quantity"
              />
              <button type="button" class="quantity-selector__button" data-increase aria-label="Increase quantity">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Add to Cart -->
          <button
            type="button"
            class="btn btn-primary w-full mb-4"
            data-add-to-cart
            ${!variant?.available ? 'disabled' : ''}
          >
            ${variant?.available ? 'Add to Cart' : 'Sold Out'}
          </button>

          <!-- View Full Details -->
          <a
            href="/products/${product.handle}"
            class="btn btn-secondary w-full"
          >
            View Full Details
          </a>

          <!-- Description -->
          ${product.description ? `
            <div class="quick-view__description mt-6 pt-6 border-t border-[var(--border)]">
              <p class="text-sm text-[var(--muted-foreground)] line-clamp-4">${product.description}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  private renderPrice(variant: ProductVariant | null): string {
    if (!variant) return ''

    const price = this.formatMoney(variant.price)
    const comparePrice = variant.compare_at_price
      ? this.formatMoney(variant.compare_at_price)
      : null

    if (comparePrice && variant.compare_at_price! > variant.price) {
      return `
        <span class="text-2xl font-bold text-[var(--destructive)]">${price}</span>
        <span class="text-lg text-[var(--muted-foreground)] line-through ml-2">${comparePrice}</span>
      `
    }

    return `<span class="text-2xl font-bold">${price}</span>`
  }

  private renderOptions(): string {
    if (!this.productData) return ''

    return this.productData.options.map((option, index) => {
      const optionKey = `option${index + 1}` as 'option1' | 'option2' | 'option3'
      const currentValue = this.selectedVariant?.[optionKey] || option.values[0]

      return `
        <div class="quick-view__option mb-4">
          <label class="block text-sm font-medium mb-2">${option.name}</label>
          <div class="flex flex-wrap gap-2" data-option="${option.name}">
            ${option.values.map(value => {
              const isSelected = value === currentValue
              const isAvailable = this.isOptionAvailable(option.name, value)

              return `
                <button
                  type="button"
                  class="quick-view__option-button ${isSelected ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}"
                  data-option-value="${value}"
                  data-option-name="${option.name}"
                  ${!isAvailable ? 'disabled' : ''}
                  aria-pressed="${isSelected}"
                >
                  ${value}
                </button>
              `
            }).join('')}
          </div>
        </div>
      `
    }).join('')
  }

  private isOptionAvailable(optionName: string, value: string): boolean {
    if (!this.productData) return false

    const optionIndex = this.productData.options.findIndex(o => o.name === optionName)
    const optionKey = `option${optionIndex + 1}` as 'option1' | 'option2' | 'option3'

    return this.productData.variants.some(v =>
      v[optionKey] === value && v.available
    )
  }

  private setupProductInteractions(): void {
    if (!this.content) return

    // Option buttons
    this.content.querySelectorAll<HTMLButtonElement>('[data-option-value]').forEach(button => {
      button.addEventListener('click', () => {
        const optionName = button.dataset.optionName
        const optionValue = button.dataset.optionValue

        if (optionName && optionValue) {
          this.selectOption(optionName, optionValue)
        }
      })
    })

    // Quantity controls
    const decreaseBtn = this.content.querySelector('[data-decrease]')
    const increaseBtn = this.content.querySelector('[data-increase]')
    const quantityInput = this.content.querySelector<HTMLInputElement>('[data-quantity]')

    decreaseBtn?.addEventListener('click', () => {
      if (this.quantity > 1) {
        this.quantity--
        if (quantityInput) quantityInput.value = String(this.quantity)
      }
    })

    increaseBtn?.addEventListener('click', () => {
      if (this.quantity < 99) {
        this.quantity++
        if (quantityInput) quantityInput.value = String(this.quantity)
      }
    })

    quantityInput?.addEventListener('change', () => {
      const value = parseInt(quantityInput.value, 10)
      if (value >= 1 && value <= 99) {
        this.quantity = value
      } else {
        quantityInput.value = String(this.quantity)
      }
    })

    // Add to cart
    const addButton = this.content.querySelector<HTMLButtonElement>('[data-add-to-cart]')
    addButton?.addEventListener('click', () => this.addToCart())

    // Close button in error state
    this.content.querySelector('[data-close]')?.addEventListener('click', () => this.close())
  }

  private selectOption(optionName: string, value: string): void {
    if (!this.productData || !this.content) return

    // Update button states
    const optionContainer = this.content.querySelector(`[data-option="${optionName}"]`)
    optionContainer?.querySelectorAll('[data-option-value]').forEach(btn => {
      const isSelected = btn.getAttribute('data-option-value') === value
      btn.classList.toggle('selected', isSelected)
      btn.setAttribute('aria-pressed', String(isSelected))
    })

    // Find matching variant
    const optionIndex = this.productData.options.findIndex(o => o.name === optionName)
    const optionKey = `option${optionIndex + 1}` as 'option1' | 'option2' | 'option3'

    // Build current selection
    const currentSelection: Record<string, string> = {}
    this.productData.options.forEach((opt, i) => {
      const key = `option${i + 1}` as 'option1' | 'option2' | 'option3'
      if (opt.name === optionName) {
        currentSelection[key] = value
      } else {
        currentSelection[key] = this.selectedVariant?.[key] || opt.values[0]
      }
    })

    // Find variant
    const variant = this.productData.variants.find(v =>
      (!currentSelection.option1 || v.option1 === currentSelection.option1) &&
      (!currentSelection.option2 || v.option2 === currentSelection.option2) &&
      (!currentSelection.option3 || v.option3 === currentSelection.option3)
    )

    if (variant) {
      this.selectedVariant = variant

      // Update price
      const priceContainer = this.content.querySelector('[data-price]')
      if (priceContainer) {
        priceContainer.innerHTML = this.renderPrice(variant)
      }

      // Update add to cart button
      const addButton = this.content.querySelector<HTMLButtonElement>('[data-add-to-cart]')
      if (addButton) {
        addButton.disabled = !variant.available
        addButton.textContent = variant.available ? 'Add to Cart' : 'Sold Out'
      }

      // Update main image
      if (variant.featured_image?.src) {
        const mainImage = this.content.querySelector<HTMLImageElement>('[data-main-image]')
        if (mainImage) {
          mainImage.src = variant.featured_image.src
        }
      }
    }
  }

  private async addToCart(): Promise<void> {
    if (!this.selectedVariant?.available || !this.content) return

    const addButton = this.content.querySelector<HTMLButtonElement>('[data-add-to-cart]')
    if (!addButton) return

    // Show loading state
    const originalText = addButton.textContent
    addButton.disabled = true
    addButton.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Adding...
    `

    try {
      await cartStore.addItem(this.selectedVariant.id, this.quantity)

      // Show success
      addButton.innerHTML = `
        <svg class="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        Added!
      `

      // Open cart drawer
      document.dispatchEvent(new CustomEvent('cart:open'))

      // Close quick view after delay
      setTimeout(() => this.close(), 1000)
    } catch (error) {
      console.error('Add to cart error:', error)
      addButton.textContent = 'Error - Try Again'
      addButton.disabled = false

      setTimeout(() => {
        if (addButton) {
          addButton.textContent = originalText
        }
      }, 2000)
    }
  }

  private formatMoney(cents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100)
  }
}

customElements.define('quick-view', QuickView)

export { QuickView }
