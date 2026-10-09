import { describe, expect, it } from 'vitest'
import { buildContext, deviceClass, isInAppBrowser, readUtm, referrerHost, sanitizeUtm } from './context'

describe('UTM parameters', () => {
  it('reads the four campaign parameters', () => {
    expect(readUtm('?utm_source=facebook&utm_medium=paid_social&utm_campaign=etf-cz_10&utm_content=video+a')).toEqual({
      utm_source: 'facebook',
      utm_medium: 'paid_social',
      utm_campaign: 'etf-cz_10',
      utm_content: 'video a',
    })
  })

  it('ignores click ids, utm_term and anything else in the URL', () => {
    expect(readUtm('?gclid=abc&fbclid=IwAR0xyz&utm_term=etf&email=a@b.cz&utm_source=google')).toEqual({ utm_source: 'google' })
  })

  it('drops values that could carry personal data', () => {
    expect(sanitizeUtm('jana.novakova@example.cz')).toBeUndefined()
    expect(sanitizeUtm('lead 777123456')).toBeUndefined()
    expect(sanitizeUtm('3f0e8f9a-1c2b-4d5e-8f70-123456789abc')).toBeUndefined()
    expect(sanitizeUtm('https://example.cz/x')).toBeUndefined()
    expect(sanitizeUtm('   ')).toBeUndefined()
    expect(sanitizeUtm('x'.repeat(200))).toHaveLength(64)
    expect(sanitizeUtm('podzim 2026')).toBe('podzim 2026')
  })
})

describe('coarse device context', () => {
  it('uses the layout breakpoints', () => {
    expect(deviceClass(320)).toBe('mobile')
    expect(deviceClass(767)).toBe('mobile')
    expect(deviceClass(768)).toBe('tablet')
    expect(deviceClass(1024)).toBe('desktop')
  })

  it('flags common in-app browsers', () => {
    expect(isInAppBrowser('Mozilla/5.0 (iPhone) [FBAN/FBIOS;FBAV/450.0]')).toBe(true)
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 14) Instagram 300.0')).toBe(true)
    expect(isInAppBrowser('Mozilla/5.0 (Linux; Android 14) musical_ly_2023')).toBe(true)
    expect(isInAppBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) AppleWebKit/605.1.15 Version/18.0 Mobile Safari/604.1')).toBe(false)
  })

  it('keeps only the host of an external referrer', () => {
    expect(referrerHost('https://l.facebook.com/l.php?u=https%3A%2F%2Fx&h=AT0', 'etf.example.cz')).toBe('l.facebook.com')
    expect(referrerHost('https://etf.example.cz/#srovnani', 'etf.example.cz')).toBeUndefined()
    expect(referrerHost('', 'etf.example.cz')).toBeUndefined()
    expect(referrerHost('not a url', 'etf.example.cz')).toBeUndefined()
  })

  it('builds a context without any identifier', () => {
    const c = buildContext({ search: '?utm_source=tiktok', viewportWidth: 390, userAgent: 'BytedanceWebview' })
    expect(c).toEqual({ utm_source: 'tiktok', device: 'mobile', in_app: true })
  })
})
