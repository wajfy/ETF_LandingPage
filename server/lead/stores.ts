/**
 * In-memory abuse protection and idempotency for the lead endpoint.
 *
 * Limitation (documented in README §13): memory is per process. On serverless hosting each
 * instance has its own copy, so limits are best-effort until a shared store (e.g. Redis/KV) is
 * added before public launch. Real duplicate protection does not depend on this: every send carries
 * a provider idempotency key derived from the request id.
 *
 * No email addresses are stored – only salted SHA-256 hashes (random salt per handler instance),
 * kept for the rate-limit window.
 */

export class SlidingWindowLimiter {
  private readonly hits = new Map<string, number[]>()
  private readonly max: number
  private readonly windowMs: number
  private readonly maxKeys: number

  constructor(max: number, windowMs: number, maxKeys = 50_000) {
    this.max = max
    this.windowMs = windowMs
    this.maxKeys = maxKeys
  }

  private recent(key: string, now: number): number[] {
    const list = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs)
    if (list.length) this.hits.set(key, list)
    else this.hits.delete(key)
    return list
  }

  /** Remaining allowance without recording anything. */
  isAllowed(key: string, now: number): boolean {
    return this.recent(key, now).length < this.max
  }

  /** Records a hit; returns false if the limit was already reached (the hit is not recorded then). */
  hit(key: string, now: number): boolean {
    const list = this.recent(key, now)
    if (list.length >= this.max) return false
    list.push(now)
    this.hits.set(key, list)
    if (this.hits.size > this.maxKeys) this.hits.delete(this.hits.keys().next().value as string)
    return true
  }

  retryAfterSeconds(key: string, now: number): number {
    const list = this.recent(key, now)
    if (!list.length) return 0
    return Math.max(1, Math.ceil((this.windowMs - (now - list[0])) / 1000))
  }
}

export type IntentState =
  | { state: 'pending'; fingerprint: string; promise: Promise<IntentResult> }
  | { state: 'done'; fingerprint: string; result: IntentResult; at: number }

/** Final result of one send intent, as returned to the browser. */
export type IntentResult = { kind: 'sent' } | { kind: 'unconfirmed' } | { kind: 'failed'; status: number; code: string }

/** Remembers send intents by request id for 24 h (the provider keeps idempotency keys as long). */
export class IntentStore {
  private readonly map = new Map<string, IntentState>()
  private readonly ttlMs: number
  private readonly maxEntries: number

  constructor(ttlMs = 24 * 60 * 60_000, maxEntries = 20_000) {
    this.ttlMs = ttlMs
    this.maxEntries = maxEntries
  }

  get(requestId: string, now: number): IntentState | undefined {
    const s = this.map.get(requestId)
    if (s && s.state === 'done' && now - s.at > this.ttlMs) {
      this.map.delete(requestId)
      return undefined
    }
    return s
  }

  set(requestId: string, value: IntentState): void {
    this.map.delete(requestId)
    this.map.set(requestId, value)
    if (this.map.size > this.maxEntries) this.map.delete(this.map.keys().next().value as string)
  }
}

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
