/**
 * Test Reveal Island - client:visible strategy
 *
 * An element that animates in when hydrated.
 * This island loads when scrolled into view.
 */

class TestReveal extends HTMLElement {
  private content: HTMLElement | null = null

  connectedCallback() {
    console.log('[Island] test-reveal hydrated (client:visible)')

    this.content = this.querySelector('[data-content]')

    // Mark as hydrated
    this.setAttribute('data-hydrated', 'true')

    // Trigger reveal animation
    requestAnimationFrame(() => {
      this.reveal()
    })
  }

  private reveal() {
    if (this.content) {
      this.content.classList.remove('opacity-0', 'translate-y-8')
      this.content.classList.add('opacity-100', 'translate-y-0')
    }

    // Dispatch custom event for tracking
    this.dispatchEvent(new CustomEvent('island:revealed', {
      bubbles: true,
      detail: { island: 'test-reveal' }
    }))
  }
}

// Register the custom element
if (!customElements.get('test-reveal')) {
  customElements.define('test-reveal', TestReveal)
}

export { TestReveal }
