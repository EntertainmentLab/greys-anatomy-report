// Helper to build a cache-busted URL using build version and current time fallback
export function withCacheBusting(url) {
  try {
    const u = new URL(url, window.location.origin)
    // Prefer build-time version so users get fresh assets when a new build is deployed
    if (typeof __APP_VERSION__ !== 'undefined') {
      u.searchParams.set('v', __APP_VERSION__)
    } else {
      // Fallback to a short-lived timestamp to bypass caches during dev
      u.searchParams.set('t', Date.now().toString())
    }
    return u.toString()
  } catch (_) {
    // If URL constructor fails (e.g., relative without base), append query manually
    const sep = url.includes('?') ? '&' : '?'
    const ver = (typeof __APP_VERSION__ !== 'undefined') ? `v=${encodeURIComponent(__APP_VERSION__)}` : `t=${Date.now()}`
    return `${url}${sep}${ver}`
  }
}

export const noStoreFetchInit = {
  // Ensure browser does not use HTTP cache for fetch responses
  cache: 'no-store',
  // Also include control headers where supported; servers may ignore, but it's safe
  headers: {
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
  }
}
