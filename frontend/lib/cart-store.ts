/**
 * Cart Store
 *
 * Reactive cart state management with pub/sub pattern.
 * Provides a single source of truth for cart state.
 */

import { cartAPI, type Cart, type CartItem } from './cart-api'

type CartListener = (cart: Cart) => void

class CartStore {
  private cart: Cart | null = null
  private listeners: Set<CartListener> = new Set()
  private loading = false
  private initialized = false

  /**
   * Initialize the cart store
   */
  async init(): Promise<Cart> {
    if (this.initialized && this.cart) {
      return this.cart
    }

    this.loading = true
    this.notify()

    try {
      this.cart = await cartAPI.get()
      this.initialized = true
      this.setupEventListeners()
      return this.cart
    } finally {
      this.loading = false
      this.notify()
    }
  }

  /**
   * Get current cart state
   */
  getCart(): Cart | null {
    return this.cart
  }

  /**
   * Get cart item count
   */
  getItemCount(): number {
    return this.cart?.item_count ?? 0
  }

  /**
   * Get cart total price
   */
  getTotalPrice(): number {
    return this.cart?.total_price ?? 0
  }

  /**
   * Get formatted total price
   */
  getFormattedTotal(): string {
    return cartAPI.formatMoney(this.getTotalPrice())
  }

  /**
   * Check if cart is loading
   */
  isLoading(): boolean {
    return this.loading
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this.getItemCount() === 0
  }

  /**
   * Find item by variant ID
   */
  findItem(variantId: number): CartItem | undefined {
    return this.cart?.items.find((item) => item.variant_id === variantId)
  }

  /**
   * Find item by key
   */
  findItemByKey(key: string): CartItem | undefined {
    return this.cart?.items.find((item) => item.key === key)
  }

  /**
   * Add item to cart
   */
  async addItem(variantId: number, quantity = 1): Promise<void> {
    this.loading = true
    this.notify()

    try {
      await cartAPI.add({ id: variantId, quantity })
      this.cart = await cartAPI.get()
    } finally {
      this.loading = false
      this.notify()
    }
  }

  /**
   * Update item quantity
   */
  async updateItem(key: string, quantity: number): Promise<void> {
    this.loading = true
    this.notify()

    try {
      this.cart = await cartAPI.update(key, quantity)
    } finally {
      this.loading = false
      this.notify()
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(key: string): Promise<void> {
    await this.updateItem(key, 0)
  }

  /**
   * Clear cart
   */
  async clear(): Promise<void> {
    this.loading = true
    this.notify()

    try {
      this.cart = await cartAPI.clear()
    } finally {
      this.loading = false
      this.notify()
    }
  }

  /**
   * Subscribe to cart changes
   */
  subscribe(listener: CartListener): () => void {
    this.listeners.add(listener)

    // Immediately call with current state if available
    if (this.cart) {
      listener(this.cart)
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Notify all listeners of cart change
   */
  private notify(): void {
    if (this.cart) {
      this.listeners.forEach((listener) => listener(this.cart!))
    }
  }

  /**
   * Set up event listeners for cart updates
   */
  private setupEventListeners(): void {
    // Listen for cart:updated events from cart-api
    document.addEventListener('cart:updated', ((event: CustomEvent) => {
      this.cart = event.detail.cart
      this.notify()
    }) as EventListener)

    // Listen for legacy cart:add events
    document.addEventListener('cart:add', (async (event: CustomEvent) => {
      const { id, quantity } = event.detail
      await this.addItem(id, quantity)
    }) as EventListener)

    // Listen for cart:refresh requests
    document.addEventListener('cart:refresh', async () => {
      this.cart = await cartAPI.get()
      this.notify()
    })
  }
}

// Export singleton instance
export const cartStore = new CartStore()

// Also export class for testing
export { CartStore }
