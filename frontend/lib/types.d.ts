/**
 * Global Type Declarations for Beacon Basics Theme
 */

declare global {
  interface Window {
    Shopify: {
      designMode: boolean
      theme: {
        name: string
        role: string
      }
      currency: {
        active: string
        rate: string
      }
      locale: string
      country: string
    }
  }

  // requestIdleCallback polyfill type
  interface Window {
    requestIdleCallback(
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ): number
  }

  interface IdleRequestCallback {
    (deadline: IdleDeadline): void
  }

  interface IdleDeadline {
    readonly didTimeout: boolean
    timeRemaining(): DOMHighResTimeStamp
  }

  interface IdleRequestOptions {
    timeout?: number
  }
}

export {}
