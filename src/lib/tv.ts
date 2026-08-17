export function isTvPath(pathname = window.location.pathname): boolean {
  const path = pathname.replace(/\/+$/, '') || '/'
  return path === '/tv'
}
