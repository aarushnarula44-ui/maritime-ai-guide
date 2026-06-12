export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return

  const payload = {
    eventName,
    properties,
    pageUrl: window.location.href,
    deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
  }

  // Fire and forget — never block UX for analytics
  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Silently ignore analytics failures
  })
}
