/**
 * Serverless entry for POST /api/lead (Vercel Functions, Web-standard handler).
 * NOT deployed yet – deployment is out of scope until the launch blockers are resolved.
 * Uses the same endpoint as the local dev server; the mock outbox preview is NOT exposed here.
 */
import { createLeadEndpoint } from '../server/lead/endpoint'

const endpoint = createLeadEndpoint(process.env)

/** Platform limit (seconds) – must stay well above the provider timeout (EMAIL_PROVIDER_TIMEOUT_MS, default 10 s),
 *  so the function answers "unconfirmed" itself instead of being cut off. */
export const maxDuration = 25

export async function POST(request: Request): Promise<Response> {
  // Behind Vercel's proxy the client IP is the first x-forwarded-for entry.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  return endpoint.handle(request, ip)
}
