/**
 * Modal Island
 *
 * Accessible modal dialog with focus trapping.
 * Supports custom content and close triggers.
 *
 * Hydration: client:idle (loads when browser is idle)
 */

class ModalIsland extends HTMLElement {
  private dialog: HTMLElement | null = null
  private overlay: HTMLElement | null = null
  private closeButtons: NodeListOf<HTMLElement> | null = null
  private focusableElements: HTMLElement[] = []
  private previouslyFocused: HTMLElement | null = null
  private isOpen = false
  private modalId: string | null = null

  connectedCallback() {
    console.log('[Island] modal hydrated (client:idle)')

    this.modalId = this.getAttribute('data-modal-id')
    this.dialog = this.querySelector('[data-modal-dialog]')
    this.overlay = this.querySelector('[data-modal-overlay]')
    this.closeButtons = this.querySelectorAll('[data-modal-close]')

    this.setupEventListeners()
    this.setupGlobalTriggers()

    this.setAttribute('data-hydrated', 'true')
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeydown)
  }

  private setupEventListeners() {
    // Close buttons
    this.closeButtons?.forEach((btn) => {
      btn.addEventListener('click', () => this.close())
    })

    // Overlay click
    this.overlay?.addEventListener('click', () => this.close())

    // Keyboard
    this.handleKeydown = this.handleKeydown.bind(this)
    document.addEventListener('keydown', this.handleKeydown)
  }

  private setupGlobalTriggers() {
    if (!this.modalId) return

    // Listen for open triggers
    document.addEventListener('click', (e) => {
      const trigger = (e.target as HTMLElement).closest(`[data-modal-trigger="${this.modalId}"]`)
      if (trigger) {
        e.preventDefault()
        this.open()
      }
    })

    // Listen for programmatic open/close
    document.addEventListener('modal:open', ((e: CustomEvent) => {
      if (e.detail?.id === this.modalId) {
        this.open()
      }
    }) as EventListener)

    document.addEventListener('modal:close', ((e: CustomEvent) => {
      if (e.detail?.id === this.modalId || !e.detail?.id) {
        this.close()
      }
    }) as EventListener)
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (!this.isOpen) return

    if (e.key === 'Escape') {
      this.close()
      return
    }

    // Focus trap
    if (e.key === 'Tab') {
      this.handleTabKey(e)
    }
  }

  private handleTabKey(e: KeyboardEvent) {
    this.updateFocusableElements()

    if (this.focusableElements.length === 0) return

    const firstElement = this.focusableElements[0]
    const lastElement = this.focusableElements[this.focusableElements.length - 1]

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  private updateFocusableElements() {
    if (!this.dialog) return

    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ')

    this.focusableElements = Array.from(
      this.dialog.querySelectorAll(focusableSelectors)
    ) as HTMLElement[]
  }

  open() {
    if (!this.dialog || !this.overlay) return
    if (this.isOpen) return

    this.isOpen = true
    this.previouslyFocused = document.activeElement as HTMLElement

    // Show modal
    this.classList.remove('hidden')
    this.overlay.classList.remove('hidden', 'opacity-0')
    this.dialog.classList.remove('hidden', 'opacity-0', 'scale-95')

    // Animate in
    requestAnimationFrame(() => {
      this.overlay?.classList.add('opacity-100')
      this.dialog?.classList.add('opacity-100', 'scale-100')
    })

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    // Focus first focusable element
    this.updateFocusableElements()
    if (this.focusableElements.length > 0) {
      setTimeout(() => {
        this.focusableElements[0]?.focus()
      }, 100)
    }

    // Dispatch event
    this.dispatchEvent(
      new CustomEvent('modal:opened', {
        bubbles: true,
        detail: { id: this.modalId }
      })
    )
  }

  close() {
    if (!this.dialog || !this.overlay) return
    if (!this.isOpen) return

    this.isOpen = false

    // Animate out
    this.overlay.classList.remove('opacity-100')
    this.overlay.classList.add('opacity-0')
    this.dialog.classList.remove('opacity-100', 'scale-100')
    this.dialog.classList.add('opacity-0', 'scale-95')

    // Restore body scroll
    document.body.style.overflow = ''

    // Hide after animation
    setTimeout(() => {
      if (!this.isOpen) {
        this.classList.add('hidden')
        this.overlay?.classList.add('hidden')
        this.dialog?.classList.add('hidden')
      }
    }, 200)

    // Restore focus
    this.previouslyFocused?.focus()

    // Dispatch event
    this.dispatchEvent(
      new CustomEvent('modal:closed', {
        bubbles: true,
        detail: { id: this.modalId }
      })
    )
  }
}

customElements.define('modal-island', ModalIsland)
