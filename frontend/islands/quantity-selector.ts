/**
 * Quantity Selector Island
 *
 * Increment/decrement input with validation.
 * Supports min/max/step values.
 *
 * Hydration: client:visible (loads when scrolled into view)
 */

class QuantitySelector extends HTMLElement {
  private input: HTMLInputElement | null = null
  private decrementBtn: HTMLButtonElement | null = null
  private incrementBtn: HTMLButtonElement | null = null
  private min = 1
  private max = Infinity
  private step = 1

  connectedCallback() {
    console.log('[Island] quantity-selector hydrated (client:visible)')

    this.input = this.querySelector('input[type="number"]')
    this.decrementBtn = this.querySelector('[data-decrement]')
    this.incrementBtn = this.querySelector('[data-increment]')

    this.loadConfig()
    this.setupEventListeners()
    this.updateButtonStates()

    this.setAttribute('data-hydrated', 'true')
  }

  private loadConfig() {
    if (this.input) {
      this.min = parseInt(this.input.min) || 1
      this.max = parseInt(this.input.max) || Infinity
      this.step = parseInt(this.input.step) || 1
    }

    // Override from data attributes
    if (this.dataset.min) this.min = parseInt(this.dataset.min)
    if (this.dataset.max) this.max = parseInt(this.dataset.max)
    if (this.dataset.step) this.step = parseInt(this.dataset.step)
  }

  private setupEventListeners() {
    // Decrement button
    this.decrementBtn?.addEventListener('click', () => {
      this.decrement()
    })

    // Increment button
    this.incrementBtn?.addEventListener('click', () => {
      this.increment()
    })

    // Input change
    this.input?.addEventListener('change', () => {
      this.validate()
    })

    // Input blur
    this.input?.addEventListener('blur', () => {
      this.validate()
    })

    // Keyboard support on buttons
    this.decrementBtn?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        this.decrement()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        this.increment()
      }
    })

    this.incrementBtn?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        this.decrement()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        this.increment()
      }
    })

    // Prevent non-numeric input
    this.input?.addEventListener('keydown', (e) => {
      // Allow: backspace, delete, tab, escape, enter, arrows
      if (
        [8, 46, 9, 27, 13, 37, 38, 39, 40].includes(e.keyCode) ||
        // Allow: Ctrl/Cmd+A, Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+X
        ((e.keyCode === 65 || e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 88) && (e.ctrlKey || e.metaKey))
      ) {
        return
      }
      // Block non-numeric
      if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
        e.preventDefault()
      }
    })
  }

  private getValue(): number {
    return parseInt(this.input?.value || '1') || this.min
  }

  private setValue(value: number) {
    if (!this.input) return

    const clampedValue = Math.min(Math.max(value, this.min), this.max)
    this.input.value = clampedValue.toString()

    this.updateButtonStates()
    this.dispatchChangeEvent(clampedValue)
  }

  private increment() {
    this.setValue(this.getValue() + this.step)
  }

  private decrement() {
    this.setValue(this.getValue() - this.step)
  }

  private validate() {
    let value = this.getValue()

    // Ensure within bounds
    value = Math.min(Math.max(value, this.min), this.max)

    // Ensure step alignment
    const remainder = (value - this.min) % this.step
    if (remainder !== 0) {
      value = value - remainder
    }

    this.setValue(value)
  }

  private updateButtonStates() {
    const value = this.getValue()

    if (this.decrementBtn) {
      this.decrementBtn.disabled = value <= this.min
      this.decrementBtn.classList.toggle('opacity-50', value <= this.min)
    }

    if (this.incrementBtn) {
      this.incrementBtn.disabled = value >= this.max
      this.incrementBtn.classList.toggle('opacity-50', value >= this.max)
    }
  }

  private dispatchChangeEvent(value: number) {
    this.dispatchEvent(
      new CustomEvent('quantity:change', {
        bubbles: true,
        detail: { value }
      })
    )

    // Also dispatch a standard input event for form compatibility
    this.input?.dispatchEvent(new Event('input', { bubbles: true }))
  }

  // Public API
  public get value(): number {
    return this.getValue()
  }

  public set value(val: number) {
    this.setValue(val)
  }
}

customElements.define('quantity-selector', QuantitySelector)
