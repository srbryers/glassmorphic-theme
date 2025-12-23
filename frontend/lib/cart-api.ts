/**
 * Cart API Wrapper
 *
 * Provides a clean interface for Shopify Cart AJAX API.
 * All cart operations dispatch events for UI updates.
 */

export interface CartItem {
  id: number
  key: string
  title: string
  quantity: number
  price: number
  line_price: number
  final_price: number
  final_line_price: number
  sku: string
  grams: number
  vendor: string
  properties: Record<string, string>
  variant_id: number
  variant_title: string
  product_id: number
  product_title: string
  product_type: string
  url: string
  image: string
  handle: string
  requires_shipping: boolean
  gift_card: boolean
  options_with_values: Array<{ name: string; value: string }>
  discounts: Array<{
    title: string
    amount: number
  }>
}

export interface Cart {
  token: string
  note: string | null
  attributes: Record<string, string>
  original_total_price: number
  total_price: number
  total_discount: number
  total_weight: number
  item_count: number
  items: CartItem[]
  requires_shipping: boolean
  currency: string
  items_subtotal_price: number
  cart_level_discount_applications: Array<{
    type: string
    key: string
    title: string
    description: string | null
    value: string
    created_at: string
    value_type: string
    allocation_method: string
    target_selection: string
    target_type: string
    total_allocated_amount: number
  }>
}

export interface AddToCartItem {
  id: number
  quantity?: number
  properties?: Record<string, string>
  selling_plan?: number
}

class CartAPI {
  private baseUrl = '/cart'

  /**
   * Fetch the current cart state
   */
  async get(): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}.js`)
    if (!response.ok) {
      throw new Error('Failed to fetch cart')
    }
    const cart = await response.json()
    this.dispatchUpdate(cart)
    return cart
  }

  /**
   * Add item(s) to cart
   */
  async add(items: AddToCartItem | AddToCartItem[]): Promise<CartItem | CartItem[]> {
    const itemsArray = Array.isArray(items) ? items : [items]

    const response = await fetch(`${this.baseUrl}/add.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsArray })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.description || 'Failed to add to cart')
    }

    const result = await response.json()

    // Fetch updated cart and dispatch
    await this.get()

    // Dispatch add event
    this.dispatch('cart:item-added', { items: result.items || [result] })

    return result.items || result
  }

  /**
   * Update item quantity by line item key
   */
  async update(key: string, quantity: number): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/change.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity })
    })

    if (!response.ok) {
      throw new Error('Failed to update cart')
    }

    const cart = await response.json()
    this.dispatchUpdate(cart)

    if (quantity === 0) {
      this.dispatch('cart:item-removed', { key })
    } else {
      this.dispatch('cart:item-updated', { key, quantity })
    }

    return cart
  }

  /**
   * Remove item from cart
   */
  async remove(key: string): Promise<Cart> {
    return this.update(key, 0)
  }

  /**
   * Clear all items from cart
   */
  async clear(): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/clear.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      throw new Error('Failed to clear cart')
    }

    const cart = await response.json()
    this.dispatchUpdate(cart)
    this.dispatch('cart:cleared', {})

    return cart
  }

  /**
   * Update cart note
   */
  async updateNote(note: string): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/update.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note })
    })

    if (!response.ok) {
      throw new Error('Failed to update cart note')
    }

    const cart = await response.json()
    this.dispatchUpdate(cart)

    return cart
  }

  /**
   * Update cart attributes
   */
  async updateAttributes(attributes: Record<string, string>): Promise<Cart> {
    const response = await fetch(`${this.baseUrl}/update.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attributes })
    })

    if (!response.ok) {
      throw new Error('Failed to update cart attributes')
    }

    const cart = await response.json()
    this.dispatchUpdate(cart)

    return cart
  }

  /**
   * Format price in cents to currency string
   */
  formatMoney(cents: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(cents / 100)
  }

  /**
   * Dispatch cart update event
   */
  private dispatchUpdate(cart: Cart): void {
    this.dispatch('cart:updated', { cart })
  }

  /**
   * Dispatch custom event
   */
  private dispatch(name: string, detail: Record<string, unknown>): void {
    document.dispatchEvent(new CustomEvent(name, { detail }))
  }
}

// Export singleton instance
export const cartAPI = new CartAPI()

// Also export class for testing
export { CartAPI }
