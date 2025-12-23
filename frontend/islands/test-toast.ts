/**
 * Test Toast Island - client:idle strategy
 *
 * A notification toast that shows when hydrated.
 * This island loads when the browser is idle.
 */

class TestToast extends HTMLElement {
  private toastElement: HTMLElement | null = null
  private closeBtn: HTMLElement | null = null
  private showBtn: HTMLElement | null = null

  connectedCallback() {
    console.log('[Island] test-toast hydrated (client:idle)')

    this.toastElement = this.querySelector('[data-toast]')
    this.closeBtn = this.querySelector('[data-close]')
    this.showBtn = this.querySelector('[data-show]')

    this.closeBtn?.addEventListener('click', this.hide.bind(this))
    this.showBtn?.addEventListener('click', this.show.bind(this))

    // Mark as hydrated
    this.setAttribute('data-hydrated', 'true')

    // Auto-show toast to indicate hydration happened
    if (this.dataset.autoShow === 'true') {
      setTimeout(() => this.show(), 500)
    }
  }

  disconnectedCallback() {
    this.closeBtn?.removeEventListener('click', this.hide.bind(this))
    this.showBtn?.removeEventListener('click', this.show.bind(this))
  }

  private show() {
    if (this.toastElement) {
      this.toastElement.classList.remove('opacity-0', 'translate-y-2', 'pointer-events-none')
      this.toastElement.classList.add('opacity-100', 'translate-y-0')
    }
  }

  private hide() {
    if (this.toastElement) {
      this.toastElement.classList.add('opacity-0', 'translate-y-2', 'pointer-events-none')
      this.toastElement.classList.remove('opacity-100', 'translate-y-0')
    }
  }
}

// Register the custom element
if (!customElements.get('test-toast')) {
  customElements.define('test-toast', TestToast)
}

export { TestToast }
