export function isLocalMode(mode, hostname) {
  return mode === 'local' && ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
}
export const isDemo = !isLocalMode(import.meta.env.VITE_APP_MODE, typeof window === 'undefined' ? '' : window.location.hostname)
