/**
 * Product Form Island
 *
 * Handles variant selection, quantity, and add-to-cart.
 * Updates price, availability, and images based on selection.
 * Uses centralized cart-store for add-to-cart operations.
 *
 * Hydration: client:visible (loads when scrolled into view)
 */

import { cartStore } from '../lib/cart-store'
import { cartAPI } from '../lib/cart-api'

interface Variant {
  id: number
  title: string
  price: number
  compare_at_price: number | null
  available: boolean
  options: string[]
  inventory_quantity: number
  inventory_policy: string
  featured_image?: {
    src: string
    alt: string
  }
}

interface ProductData {
  id: number
  title: string
  variants: Variant[]
  options: Array<{
    name: string
    values: string[]
  }>
}

class ProductForm extends HTMLElement {
  private form: HTMLFormElement | null = null
  private variantSelect: HTMLSelectElement | null = null
  private optionInputs: NodeListOf<HTMLInputElement> | null = null
  private priceElement: HTMLElement | null = null
  private comparePriceElement: HTMLElement | null = null
  private addButton: HTMLButtonElement | null = null
  private quantityInput: HTMLInputElement | null = null
  private productData: ProductData | null = null
  private currentVariant: Variant | null = null

  connectedCallback() {
    console.log('[Island] product-form hydrated (client:visible)')

    this.form = this.querySelector('form')
    this.variantSelect = this.querySelector('[data-variant-select]')
    this.optionInputs = this.querySelectorAll('[data-option-input]')
    this.priceElement = this.querySelector('[data-price]')
    this.comparePriceElement = this.querySelector('[data-compare-price]')
    this.addButton = this.querySelector('[data-add-button]')
    this.quantityInput = this.querySelector('[data-quantity-input]')

    this.loadProductData()
    this.setupEventListeners()

    this.setAttribute('data-hydrated', 'true')
  }

  private loadProductData() {
    const dataScript = this.querySelector('[data-product-json]')
    if (dataScript) {
      try {
        this.productData = JSON.parse(dataScript.textContent || '{}')
        this.updateCurrentVariant()
      } catch (e) {
        console.error('Failed to parse product data:', e)
      }
    }
  }

  private setupEventListeners() {
    // Variant select change
    this.variantSelect?.addEventListener('change', () => {
      this.updateCurrentVariant()
    })

    // Option inputs (radio/buttons)
    this.optionInputs?.forEach((input) => {
      input.addEventListener('change', () => {
        this.updateVariantFromOptions()
      })
    })

    // Quantity controls
    const decrementBtn = this.querySelector('[data-quantity-decrement]')
    const incrementBtn = this.querySelector('[data-quantity-increment]')

    decrementBtn?.addEventListener('click', () => {
      if (this.quantityInput) {
        const current = parseInt(this.quantityInput.value) || 1
        if (current > 1) {
          this.quantityInput.value = (current - 1).toString()
        }
      }
    })

    incrementBtn?.addEventListener('click', () => {
      if (this.quantityInput) {
        const current = parseInt(this.quantityInput.value) || 1
        this.quantityInput.value = (current + 1).toString()
      }
    })

    // Form submit
    this.form?.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleAddToCart()
    })
  }

  private updateCurrentVariant() {
    if (!this.productData) return

    const variantId = this.variantSelect
      ? parseInt(this.variantSelect.value)
      : this.getVariantFromOptions()

    this.currentVariant = this.productData.variants.find((v) => v.id === variantId) || null

    this.updateUI()
    this.updateURL()
  }

  private updateVariantFromOptions() {
    if (!this.productData || !this.optionInputs) return

    const selectedOptions: string[] = []
    this.optionInputs.forEach((input) => {
      if (input.checked) {
        selectedOptions[parseInt(input.dataset.optionIndex || '0')] = input.value
      }
    })

    const variant = this.productData.variants.find((v) =>
      v.options.every((opt, i) => opt === selectedOptions[i])
    )

    if (variant && this.variantSelect) {
      this.variantSelect.value = variant.id.toString()
    }

    this.currentVariant = variant || null
    this.updateUI()
    this.updateURL()
  }

  private getVariantFromOptions(): number | null {
    if (!this.productData || !this.optionInputs) return null

    const selectedOptions: string[] = []
    this.optionInputs.forEach((input) => {
      if (input.checked) {
        selectedOptions[parseInt(input.dataset.optionIndex || '0')] = input.value
      }
    })

    const variant = this.productData.variants.find((v) =>
      v.options.every((opt, i) => opt === selectedOptions[i])
    )

    return variant?.id || null
  }

  private updateUI() {
    if (!this.currentVariant) {
      // Variant unavailable
      if (this.addButton) {
        this.addButton.disabled = true
        this.addButton.textContent = 'Unavailable'
      }
      return
    }

    // Update price
    if (this.priceElement) {
      this.priceElement.textContent = this.formatMoney(this.currentVariant.price)
    }

    // Update compare price
    if (this.comparePriceElement) {
      if (this.currentVariant.compare_at_price && this.currentVariant.compare_at_price > this.currentVariant.price) {
        this.comparePriceElement.textContent = this.formatMoney(this.currentVariant.compare_at_price)
        this.comparePriceElement.classList.remove('hidden')
        this.priceElement?.classList.add('price-sale')
      } else {
        this.comparePriceElement.classList.add('hidden')
        this.priceElement?.classList.remove('price-sale')
      }
    }

    // Update button
    if (this.addButton) {
      this.addButton.disabled = !this.currentVariant.available
      this.addButton.textContent = this.currentVariant.available ? 'Add to Cart' : 'Sold Out'
    }

    // Update featured image
    if (this.currentVariant.featured_image) {
      this.dispatchEvent(
        new CustomEvent('variant:image-change', {
          bubbles: true,
          detail: {
            src: this.currentVariant.featured_image.src,
            alt: this.currentVariant.featured_image.alt
          }
        })
      )
    }

    // Update option swatches (mark selected)
    this.optionInputs?.forEach((input) => {
      const optionIndex = parseInt(input.dataset.optionIndex || '0')
      const isSelected = input.value === this.currentVariant?.options[optionIndex]
      input.checked = isSelected
      input.closest('label')?.classList.toggle('selected', isSelected)
    })

    // Update stock display
    this.updateStockDisplay()
  }

  private updateStockDisplay(): void {
    const stockEl = this.querySelector('[data-stock-display]') as HTMLElement | null
    if (!stockEl || !this.currentVariant) return

    const style = stockEl.dataset.style || 'count'
    const threshold = parseInt(stockEl.dataset.threshold || '5', 10)
    const inventory = this.currentVariant.inventory_quantity || 0
    const available = this.currentVariant.available
    const allowsBackorder = this.currentVariant.inventory_policy === 'continue'

    let html = ''
    if (available) {
      if (inventory <= 0 && allowsBackorder) {
        html = `<span class="stock-level--backorder">Available for backorder</span>`
      } else if (style === 'count') {
        if (inventory <= threshold) {
          html = `<span class="stock-level--low">Only ${inventory} left</span>`
        } else {
          html = `<span class="stock-level--in-stock">${inventory} in stock</span>`
        }
      } else if (inventory <= threshold) {
        html = `<span class="stock-level--low">Only ${inventory} left</span>`
      }
    }

    stockEl.innerHTML = html
  }

  private updateURL() {
    if (!this.currentVariant) return

    const url = new URL(window.location.href)
    url.searchParams.set('variant', this.currentVariant.id.toString())
    window.history.replaceState({}, '', url.toString())
  }

  private async handleAddToCart() {
    if (!this.currentVariant || !this.currentVariant.available) return

    const quantity = parseInt(this.quantityInput?.value || '1')

    // Disable button during request
    if (this.addButton) {
      this.addButton.disabled = true
      this.addButton.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Adding...
      `
    }

    try {
      // Use cart-store for centralized cart management
      await cartStore.addItem(this.currentVariant.id, quantity)

      // Visual feedback
      if (this.addButton) {
        this.addButton.innerHTML = `
          <svg class="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Added!
        `

        // Open cart drawer
        document.dispatchEvent(new CustomEvent('cart:open'))

        setTimeout(() => {
          if (this.addButton && this.currentVariant?.available) {
            this.addButton.disabled = false
            this.addButton.textContent = 'Add to Cart'
          }
        }, 2000)
      }
    } catch (error) {
      console.error('Add to cart failed:', error)
      if (this.addButton) {
        this.addButton.disabled = false
        this.addButton.textContent = 'Error - Try Again'
        setTimeout(() => {
          if (this.addButton && this.currentVariant?.available) {
            this.addButton.textContent = 'Add to Cart'
          }
        }, 2000)
      }
    }
  }

  private formatMoney(cents: number): string {
    return cartAPI.formatMoney(cents)
  }
}

customElements.define('product-form', ProductForm)
