/**
 * Header Navigation Island
 *
 * Handles mobile menu toggle, dropdown navigation,
 * and scroll-based header styling.
 *
 * Hydration: client:load (immediate - critical for navigation)
 */

class HeaderNav extends HTMLElement {
  private menuButton: HTMLButtonElement | null = null
  private mobileMenu: HTMLElement | null = null
  private isMenuOpen = false
  private header: HTMLElement | null = null
  private lastScrollY = 0
  private isScrolled = false

  connectedCallback() {
    console.log('[Island] header-nav hydrated (client:load)')

    this.menuButton = this.querySelector('[data-menu-toggle]')
    this.mobileMenu = this.querySelector('[data-mobile-menu]')
    this.header = this.closest('header')

    this.setupMenuToggle()
    this.setupDropdowns()
    this.setupScrollBehavior()
    this.setupKeyboardNavigation()

    this.setAttribute('data-hydrated', 'true')
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.handleResize)
    document.removeEventListener('keydown', this.handleKeydown)
  }

  private setupMenuToggle() {
    if (!this.menuButton || !this.mobileMenu) return

    this.menuButton.addEventListener('click', () => {
      this.toggleMenu()
    })

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && !this.contains(e.target as Node)) {
        this.closeMenu()
      }
    })
  }

  private setupDropdowns() {
    const dropdownTriggers = this.querySelectorAll('[data-dropdown-trigger]')

    dropdownTriggers.forEach((trigger) => {
      const dropdown = trigger.nextElementSibling as HTMLElement

      if (!dropdown?.hasAttribute('data-dropdown')) return

      // Desktop: hover behavior
      trigger.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 768) {
          this.openDropdown(dropdown)
        }
      })

      trigger.parentElement?.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 768) {
          this.closeDropdown(dropdown)
        }
      })

      // Mobile: click behavior
      trigger.addEventListener('click', (e) => {
        if (window.innerWidth < 768) {
          e.preventDefault()
          this.toggleDropdown(dropdown)
        }
      })
    })
  }

  private setupScrollBehavior() {
    this.handleScroll = this.handleScroll.bind(this)
    this.handleResize = this.handleResize.bind(this)

    window.addEventListener('scroll', this.handleScroll, { passive: true })
    window.addEventListener('resize', this.handleResize, { passive: true })

    // Initial check
    this.handleScroll()
  }

  private setupKeyboardNavigation() {
    this.handleKeydown = this.handleKeydown.bind(this)
    document.addEventListener('keydown', this.handleKeydown)
  }

  private handleScroll = () => {
    const scrollY = window.scrollY
    const shouldBeScrolled = scrollY > 50

    if (shouldBeScrolled !== this.isScrolled) {
      this.isScrolled = shouldBeScrolled
      this.header?.classList.toggle('header-scrolled', shouldBeScrolled)
    }

    // Hide/show header on scroll (optional - uncomment to enable)
    // const isScrollingDown = scrollY > this.lastScrollY && scrollY > 100
    // this.header?.classList.toggle('header-hidden', isScrollingDown)

    this.lastScrollY = scrollY
  }

  private handleResize = () => {
    // Close mobile menu on desktop
    if (window.innerWidth >= 768 && this.isMenuOpen) {
      this.closeMenu()
    }
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (this.isMenuOpen) {
        this.closeMenu()
        this.menuButton?.focus()
      }
    }
  }

  private toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu()
    } else {
      this.openMenu()
    }
  }

  private openMenu() {
    if (!this.mobileMenu || !this.menuButton) return

    this.isMenuOpen = true
    this.mobileMenu.classList.remove('hidden')
    this.mobileMenu.setAttribute('aria-hidden', 'false')
    this.menuButton.setAttribute('aria-expanded', 'true')

    // Animate in
    requestAnimationFrame(() => {
      this.mobileMenu?.classList.add('menu-open')
    })

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    // Focus first menu item
    const firstLink = this.mobileMenu.querySelector('a')
    firstLink?.focus()
  }

  private closeMenu() {
    if (!this.mobileMenu || !this.menuButton) return

    this.isMenuOpen = false
    this.mobileMenu.classList.remove('menu-open')
    this.mobileMenu.setAttribute('aria-hidden', 'true')
    this.menuButton.setAttribute('aria-expanded', 'false')

    // Restore body scroll
    document.body.style.overflow = ''

    // Hide after animation
    setTimeout(() => {
      if (!this.isMenuOpen) {
        this.mobileMenu?.classList.add('hidden')
      }
    }, 300)
  }

  private openDropdown(dropdown: HTMLElement) {
    dropdown.classList.remove('hidden')
    dropdown.setAttribute('aria-hidden', 'false')

    requestAnimationFrame(() => {
      dropdown.classList.add('dropdown-open')
    })
  }

  private closeDropdown(dropdown: HTMLElement) {
    dropdown.classList.remove('dropdown-open')
    dropdown.setAttribute('aria-hidden', 'true')

    setTimeout(() => {
      if (!dropdown.classList.contains('dropdown-open')) {
        dropdown.classList.add('hidden')
      }
    }, 200)
  }

  private toggleDropdown(dropdown: HTMLElement) {
    if (dropdown.classList.contains('dropdown-open')) {
      this.closeDropdown(dropdown)
    } else {
      this.openDropdown(dropdown)
    }
  }
}

customElements.define('header-nav', HeaderNav)
