/**
 * Builds the /api/lead endpoint from environment variables: picks the provider (mock by default,
 * Resend only when fully and explicitly configured) and fails closed on invalid configuration.
 * Used by the Vite dev middleware (server/devApi.ts) and the serverless entry (api/lead.ts).
 */
import { loadLeadConfig, type LeadConfig } from '../config'
import { MockEmailProvider } from '../email/mockProvider'
import type { EmailProvider } from '../email/provider'
import { ResendEmailProvider } from '../email/resendProvider'
import { createLeadHandler, type LogEvent } from './handler'

export interface LeadEndpoint {
  handle: (request: Request, clientIp: string) => Promise<Response>
  /** Present only in mock mode – the in-memory outbox for the local preview. */
  mockOutbox: MockEmailProvider | null
  mode: LeadConfig['mode'] | 'misconfigured'
}

const defaultLog = (e: LogEvent) => {
  // Structured, without personal data (no email, no IP).
  console.info(`[lead] ${JSON.stringify(e)}`)
}

export function createLeadEndpoint(env: Record<string, string | undefined>, log: (e: LogEvent) => void = defaultLog): LeadEndpoint {
  const loaded = loadLeadConfig(env)
  if (!loaded.ok) {
    console.error(`[lead] configuration error – endpoint disabled: ${loaded.error}`)
    return {
      mode: 'misconfigured',
      mockOutbox: null,
      handle: async () =>
        new Response(JSON.stringify({ status: 'error', code: 'unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
        }),
    }
  }
  for (const w of loaded.warnings) console.warn(`[lead] ${w}`)

  const { config } = loaded
  let provider: EmailProvider
  let mockOutbox: MockEmailProvider | null = null
  if (config.mode === 'resend' && config.resend) {
    provider = new ResendEmailProvider(config.resend.apiKey, config.resend.from, config.resend.replyTo)
    console.info('[lead] delivery mode: RESEND (real emails are sent)')
  } else {
    mockOutbox = new MockEmailProvider()
    provider = mockOutbox
    console.info('[lead] delivery mode: MOCK (nothing is sent; preview at /api/dev/outbox)')
  }

  const handler = createLeadHandler({ config, provider, log })
  return { mode: config.mode, mockOutbox, handle: handler }
}
