/**
 * Mock email provider – the default for local development.
 * - Never contacts Resend or any network service.
 * - Keeps only the last few rendered emails in memory (for the local preview at /api/dev/outbox),
 *   with the recipient address masked. Nothing is written to disk; a restart clears everything.
 * - Mirrors the provider's idempotency: the same key returns the same id without a second "send".
 */
import type { EmailProvider, OutgoingEmail, SendOptions, SendOutcome } from './provider'

export interface OutboxEntry {
  id: string
  toMasked: string
  subject: string
  html: string
  text: string
  idempotencyKey: string
}

/** "jana.novakova@example.cz" → "j***@e***.cz" (enough to recognise a test address, not to identify anyone). */
export function maskEmail(email: string): string {
  const [local, domain = ''] = email.split('@')
  const parts = domain.split('.')
  const tld = parts.length > 1 ? parts.pop() : ''
  return `${local.slice(0, 1)}***@${(parts[0] ?? '').slice(0, 1)}***${tld ? `.${tld}` : ''}`
}

export class MockEmailProvider implements EmailProvider {
  readonly mode = 'mock' as const
  private readonly outbox: OutboxEntry[] = []
  private readonly byKey = new Map<string, string>()
  private counter = 0
  private readonly maxEntries: number
  /** Test hook: simulate provider behaviour (failure, timeout) before the mock "accepts". */
  private readonly behaviour?: (email: OutgoingEmail, opts: SendOptions) => Promise<SendOutcome | null>

  constructor(maxEntries = 10, behaviour?: (email: OutgoingEmail, opts: SendOptions) => Promise<SendOutcome | null>) {
    this.maxEntries = maxEntries
    this.behaviour = behaviour
  }

  async send(email: OutgoingEmail, opts: SendOptions): Promise<SendOutcome> {
    if (this.behaviour) {
      const forced = await this.behaviour(email, opts)
      if (forced) return forced
    }
    const existing = this.byKey.get(opts.idempotencyKey)
    if (existing) return { ok: true, id: existing }

    const id = `mock_${++this.counter}`
    this.byKey.set(opts.idempotencyKey, id)
    this.outbox.unshift({ id, toMasked: maskEmail(email.to), subject: email.subject, html: email.html, text: email.text, idempotencyKey: opts.idempotencyKey })
    this.outbox.length = Math.min(this.outbox.length, this.maxEntries)
    return { ok: true, id }
  }

  /** Read-only view for the local dev preview and tests. */
  entries(): readonly OutboxEntry[] {
    return this.outbox
  }
}
