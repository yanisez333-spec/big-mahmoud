export {}

declare global {
  interface Window {
    showToast:   (msg: string, type?: 'info' | 'success' | 'error', duration?: number) => void
    showCookies: () => void
    showLegal:   () => void
  }
}
