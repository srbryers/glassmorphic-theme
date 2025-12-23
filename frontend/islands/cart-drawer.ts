/**
 * Cart Drawer Island
 *
 * Slide-out cart drawer with AJAX cart functionality.
 * Uses centralized cart-store for reactive state management.
 *
 * Hydration: client:idle (loads when browser is idle)
 */

import { cartStore } from '../lib/cart-store'
import { cartAPI, type Cart, type CartItem } from '../lib/cart-api'

class CartDrawer extends HTMLElement {
  private drawer: HTMLElement | null = null
  private overlay: HTMLElement | null = null
  private closeBtn: HTMLElement | null = null
  private cartItems: HTMLElement | null = null
  private cartCount: HTMLElement | null = null
  private cartTotal: HTMLElement | null = null
  private emptyState: HTMLElement | null = null
  private isOpen = false
  private unsubscribe: (() => void) | null = null

  connectedCallback() {
    console.log('[Island] cart-drawer hydrated (client:idle)')

    this.drawer = this.querySelector('[data-drawer]')
    this.overlay = this.querySelector('[data-overlay]')
    this.closeBtn = this.querySelector('[data-close]')
    this.cartItems = this.querySelector('[data-cart-items]')
    this.cartCount = this.querySelector('[data-cart-count]')
    this.cartTotal = this.querySelector('[data-cart-total]')
    this.emptyState = this.querySelector('[data-empty-state]')

    this.setupEventListeners()
    this.setupCartTriggers()
    this.subscribeToCart()

    this.setAttribute('data-hydrated', 'true')
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeydown)
    this.unsubscribe?.()
  }

  private setupEventListeners() {
    // Close button
    this.closeBtn?.addEventListener('click', () => this.close())

    // Overlay click
    this.overlay?.addEventListener('click', () => this.close())

    // Keyboard
    this.handleKeydown = this.handleKeydown.bind(this)
    document.addEventListener('keydown', this.handleKeydown)

    // Cart item actions (delegated)
    this.cartItems?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement
      const removeBtn = target.closest('[data-remove]')
      const incrementBtn = target.closest('[data-increment]')
      const decrementBtn = target.closest('[data-decrement]')

      if (removeBtn) {
        const key = removeBtn.getAttribute('data-key')
        if (key) {
          await cartStore.removeItem(key)
        }
      }

      if (incrementBtn) {
        const key = incrementBtn.getAttribute('data-key')
        const quantity = parseInt(incrementBtn.getAttribute('data-quantity') || '1')
        if (key) {
          await cartStore.updateItem(key, quantity + 1)
        }
      }

      if (decrementBtn) {
        const key = decrementBtn.getAttribute('data-key')
        const quantity = parseInt(decrementBtn.getAttribute('data-quantity') || '1')
        if (key && quantity > 1) {
          await cartStore.updateItem(key, quantity - 1)
        }
      }
    })
  }

  private setupCartTriggers() {
    // Listen for cart open triggers anywhere on the page
    document.addEventListener('click', (e) => {
      const trigger = (e.target as HTMLElement).closest('[data-cart-trigger]')
      if (trigger) {
        e.preventDefault()
        this.open()
      }
    })

    // Listen for cart:open custom event (from quick-view, product-form, etc.)
    document.addEventListener('cart:open', () => {
      this.open()
    })

    // Listen for cart:add events (legacy support)
    document.addEventListener('cart:add', (async (e: CustomEvent) => {
      const { id, quantity } = e.detail
      await cartStore.addItem(id, quantity)
      this.open()
    }) as EventListener)
  }

  private subscribeToCart() {
    // Initialize cart store and subscribe to updates
    cartStore.init().then((cart) => {
      this.renderCart(cart)
    })

    // Subscribe to future cart updates
    this.unsubscribe = cartStore.subscribe((cart) => {
      this.renderCart(cart)
    })
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.isOpen) {
      this.close()
    }
  }

  open() {
    if (!this.drawer || !this.overlay) return

    this.isOpen = true
    this.classList.remove('hidden') // Show the cart-drawer container
    this.drawer.classList.remove('translate-x-full')
    this.overlay.classList.remove('hidden', 'opacity-0')

    document.body.style.overflow = 'hidden'

    // Focus trap
    const firstFocusable = this.drawer.querySelector('button, a, input')
    ;(firstFocusable as HTMLElement)?.focus()

    this.dispatchEvent(new CustomEvent('cart:opened', { bubbles: true }))
  }

  close() {
    if (!this.drawer || !this.overlay) return

    this.isOpen = false
    this.drawer.classList.add('translate-x-full')
    this.overlay.classList.add('opacity-0')

    document.body.style.overflow = ''

    setTimeout(() => {
      this.overlay?.classList.add('hidden')
      this.classList.add('hidden') // Hide the cart-drawer container
    }, 300)

    this.dispatchEvent(new CustomEvent('cart:closed', { bubbles: true }))
  }

  private renderCart(cart: Cart) {
    // Update count
    if (this.cartCount) {
      this.cartCount.textContent = cart.item_count.toString()
      this.cartCount.classList.toggle('hidden', cart.item_count === 0)
    }

    // Update cart icon in header (global update)
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = cart.item_count.toString()
      el.classList.toggle('hidden', cart.item_count === 0)
    })

    // Update total
    if (this.cartTotal) {
      this.cartTotal.textContent = cartAPI.formatMoney(cart.total_price)
    }

    // Show/hide empty state
    if (this.emptyState) {
      this.emptyState.classList.toggle('hidden', cart.items.length > 0)
    }

    // Render items
    if (this.cartItems) {
      if (cart.items.length === 0) {
        this.cartItems.innerHTML = ''
      } else {
        this.cartItems.innerHTML = cart.items.map((item) => this.renderCartItem(item)).join('')
      }
    }

    // Show loading state indicator
    if (cartStore.isLoading()) {
      this.drawer?.classList.add('cart-loading')
    } else {
      this.drawer?.classList.remove('cart-loading')
    }
  }

  private renderCartItem(item: CartItem): string {
    const imageUrl = item.image ? this.getOptimizedImage(item.image, 160) : ''

    return `
      <div class="flex gap-4 py-4 border-b border-[var(--border)]" data-line-item="${item.key}">
        ${imageUrl ? `
          <a href="${item.url}" class="flex-shrink-0 w-20 h-20 bg-[var(--muted)] rounded-lg overflow-hidden">
            <img src="${imageUrl}" alt="${item.title}" class="w-full h-full object-cover" loading="lazy">
          </a>
        ` : ''}
        <div class="flex-1 min-w-0">
          <a href="${item.url}" class="font-medium text-[var(--foreground)] hover:text-[var(--primary)] line-clamp-2">
            ${item.title}
          </a>
          ${item.variant_title && item.variant_title !== 'Default Title' ? `
            <p class="text-sm text-[var(--muted-foreground)]">${item.variant_title}</p>
          ` : ''}
          ${this.renderItemDiscounts(item)}
          <div class="flex items-center gap-3 mt-2">
            <div class="quantity-selector">
              <button
                type="button"
                data-decrement
                data-key="${item.key}"
                data-quantity="${item.quantity}"
                aria-label="Decrease quantity"
                ${item.quantity <= 1 ? 'disabled' : ''}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                </svg>
              </button>
              <span class="quantity-selector__value">${item.quantity}</span>
              <button
                type="button"
                data-increment
                data-key="${item.key}"
                data-quantity="${item.quantity}"
                aria-label="Increase quantity"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </div>
            ${this.renderItemPrice(item)}
          </div>
        </div>
        <button
          type="button"
          data-remove
          data-key="${item.key}"
          class="self-start p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
          aria-label="Remove ${item.title}"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `
  }

  private renderItemPrice(item: CartItem): string {
    const hasDiscount = item.final_line_price < item.line_price

    if (hasDiscount) {
      return `
        <div class="flex flex-col items-end">
          <span class="price price-sale">${cartAPI.formatMoney(item.final_line_price)}</span>
          <span class="price-compare text-xs">${cartAPI.formatMoney(item.line_price)}</span>
        </div>
      `
    }

    return `<span class="price">${cartAPI.formatMoney(item.final_line_price)}</span>`
  }

  private renderItemDiscounts(item: CartItem): string {
    if (!item.discounts || item.discounts.length === 0) return ''

    return `
      <div class="flex flex-wrap gap-1 mt-1">
        ${item.discounts.map(discount => `
          <span class="inline-flex items-center gap-1 text-xs text-[var(--primary)]">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            ${discount.title}
          </span>
        `).join('')}
      </div>
    `
  }

  private getOptimizedImage(url: string, width: number): string {
    // Shopify CDN image optimization
    if (url.includes('cdn.shopify.com')) {
      return url.replace(/(_\d+x\d+)?(\.[^.]+)$/, `_${width}x$2`)
    }
    return url
  }
}

customElements.define('cart-drawer', CartDrawer)

export { CartDrawer }
