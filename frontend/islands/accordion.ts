/**
 * Accordion Island
 *
 * Expandable/collapsible content sections.
 * Supports single or multiple open panels.
 *
 * Hydration: client:visible (loads when scrolled into view)
 */

class AccordionIsland extends HTMLElement {
  private items: NodeListOf<HTMLElement> | null = null
  private allowMultiple = false

  connectedCallback() {
    console.log('[Island] accordion hydrated (client:visible)')

    this.items = this.querySelectorAll('[data-accordion-item]')
    this.allowMultiple = this.hasAttribute('data-allow-multiple')

    this.setupEventListeners()
    this.initializeState()

    this.setAttribute('data-hydrated', 'true')
  }

  private setupEventListeners() {
    this.items?.forEach((item) => {
      const trigger = item.querySelector('[data-accordion-trigger]')
      trigger?.addEventListener('click', () => this.toggle(item))

      // Keyboard support
      trigger?.addEventListener('keydown', (e) => {
        const event = e as KeyboardEvent
        if (event.key === 'Enter' || event.key === ' ') {
          e.preventDefault()
          this.toggle(item)
        }
      })
    })
  }

  private initializeState() {
    this.items?.forEach((item) => {
      const isOpen = item.hasAttribute('data-open')
      const content = item.querySelector('[data-accordion-content]') as HTMLElement
      const trigger = item.querySelector('[data-accordion-trigger]')
      const icon = trigger?.querySelector('[data-accordion-icon]')

      if (content) {
        if (isOpen) {
          content.style.maxHeight = `${content.scrollHeight}px`
          content.classList.remove('opacity-0')
          item.classList.add('accordion-open')
          icon?.classList.add('rotate-180')
        } else {
          content.style.maxHeight = '0px'
          content.classList.add('opacity-0')
          icon?.classList.remove('rotate-180')
        }
      }

      trigger?.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
    })
  }

  private toggle(item: HTMLElement) {
    const isOpen = item.hasAttribute('data-open')

    if (isOpen) {
      this.close(item)
    } else {
      // Close others if not allowing multiple
      if (!this.allowMultiple) {
        this.items?.forEach((otherItem) => {
          if (otherItem !== item && otherItem.hasAttribute('data-open')) {
            this.close(otherItem)
          }
        })
      }
      this.open(item)
    }
  }

  private open(item: HTMLElement) {
    const content = item.querySelector('[data-accordion-content]') as HTMLElement
    const trigger = item.querySelector('[data-accordion-trigger]')
    const icon = trigger?.querySelector('[data-accordion-icon]')

    if (!content) return

    item.setAttribute('data-open', '')
    item.classList.add('accordion-open')
    trigger?.setAttribute('aria-expanded', 'true')
    icon?.classList.add('rotate-180')

    // Animate open
    content.style.maxHeight = `${content.scrollHeight}px`
    content.classList.remove('opacity-0')

    // Dispatch event
    this.dispatchEvent(
      new CustomEvent('accordion:open', {
        bubbles: true,
        detail: { item }
      })
    )
  }

  private close(item: HTMLElement) {
    const content = item.querySelector('[data-accordion-content]') as HTMLElement
    const trigger = item.querySelector('[data-accordion-trigger]')
    const icon = trigger?.querySelector('[data-accordion-icon]')

    if (!content) return

    item.removeAttribute('data-open')
    item.classList.remove('accordion-open')
    trigger?.setAttribute('aria-expanded', 'false')
    icon?.classList.remove('rotate-180')

    // Animate close
    content.style.maxHeight = '0px'
    content.classList.add('opacity-0')

    // Dispatch event
    this.dispatchEvent(
      new CustomEvent('accordion:close', {
        bubbles: true,
        detail: { item }
      })
    )
  }
}

customElements.define('accordion-island', AccordionIsland)
