/**
 * Coarse, non-identifying page context (README §6): UTM campaign parameters, device class and an
 * in-app-browser flag. Pure functions over strings/numbers so they are testable without a DOM.
 * Click identifiers (gclid, fbclid, …) and utm_term are deliberately ignored.
 */
import type { DeviceClass, EventContext } from './events'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const

/**
 * Keeps a UTM value only if it looks like a campaign label. Values that could carry personal data
 * (an email address, a long digit run such as a phone number, a UUID-like id) are dropped.
 */
export function sanitizeUtm(raw: string | null): string | undefined {
  if (raw === null) return undefined
  const v = raw.trim().slice(0, 64)
  if (!v) return undefined
  if (!/^[\p{L}\p{N} ._+-]+$/u.test(v)) return undefined // also excludes "@", "/", "=", "?"
  if (/\d{6,}/.test(v)) return undefined
  if (/[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}/i.test(v)) return undefined
  return v
}

export function readUtm(search: string): Pick<EventContext, (typeof UTM_KEYS)[number]> {
  const params = new URLSearchParams(search)
  const out: Partial<Record<(typeof UTM_KEYS)[number], string>> = {}
  for (const key of UTM_KEYS) {
    const v = sanitizeUtm(params.get(key))
    if (v !== undefined) out[key] = v
  }
  return out
}

/** Viewport-based class matching the layout breakpoints (md 768, lg 1024) – not a device fingerprint. */
export function deviceClass(viewportWidth: number): DeviceClass {
  if (viewportWidth < 768) return 'mobile'
  if (viewportWidth < 1024) return 'tablet'
  return 'desktop'
}

/** In-app browsers of the ad platforms we expect traffic from (first-screen QA, README §10). */
export function isInAppBrowser(userAgent: string): boolean {
  return /FBAN|FBAV|FB_IAB|Instagram|musical_ly|BytedanceWebview|TikTok|LinkedInApp|Snapchat|Pinterest/i.test(userAgent)
}

/** Only the host of an external referrer; same-site and unparsable referrers are dropped. */
export function referrerHost(referrer: string, ownHost: string): string | undefined {
  if (!referrer) return undefined
  try {
    const host = new URL(referrer).hostname.toLowerCase()
    if (!host || host === ownHost.toLowerCase()) return undefined
    return /^[a-z0-9.-]{1,100}$/.test(host) ? host : undefined
  } catch {
    return undefined
  }
}

export function buildContext(input: { search: string; viewportWidth: number; userAgent: string }): EventContext {
  return { ...readUtm(input.search), device: deviceClass(input.viewportWidth), in_app: isInAppBrowser(input.userAgent) }
}
