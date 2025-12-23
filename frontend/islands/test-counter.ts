/**
 * Test Counter Island - client:load strategy
 *
 * A simple counter to verify immediate hydration works.
 * This island loads as soon as the page loads.
 */

class TestCounter extends HTMLElement {
  private count = 0
  private countDisplay: HTMLElement | null = null
  private incrementBtn: HTMLElement | null = null
  private decrementBtn: HTMLElement | null = null

  connectedCallback() {
    console.log('[Island] test-counter hydrated (client:load)')

    this.countDisplay = this.querySelector('[data-count]')
    this.incrementBtn = this.querySelector('[data-increment]')
    this.decrementBtn = this.querySelector('[data-decrement]')

    // Get initial count from data attribute
    this.count = parseInt(this.dataset.initialCount || '0', 10)
    this.updateDisplay()

    this.incrementBtn?.addEventListener('click', this.increment.bind(this))
    this.decrementBtn?.addEventListener('click', this.decrement.bind(this))

    // Mark as hydrated
    this.setAttribute('data-hydrated', 'true')
  }

  disconnectedCallback() {
    this.incrementBtn?.removeEventListener('click', this.increment.bind(this))
    this.decrementBtn?.removeEventListener('click', this.decrement.bind(this))
  }

  private increment() {
    this.count++
    this.updateDisplay()
  }

  private decrement() {
    this.count--
    this.updateDisplay()
  }

  private updateDisplay() {
    if (this.countDisplay) {
      this.countDisplay.textContent = String(this.count)
    }
  }
}

// Register the custom element
if (!customElements.get('test-counter')) {
  customElements.define('test-counter', TestCounter)
}

export { TestCounter }
