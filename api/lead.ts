/**
 * Serverless entry for POST /api/lead (Vercel Functions, Web-standard handler).
 * NOT deployed yet – deployment is out of scope until the launch blockers are resolved.
 * Uses the same endpoint as the local dev server; the mock outbox preview is NOT exposed here.
 */
import { createLeadEndpoint } from '../server/lead/endpoint.js'

const endpoint = createLeadEndpoint(process.env)

// The function time limit is set in vercel.json (functions["api/lead.ts"].maxDuration = 25 s). It must
// stay above the browser timeout (20 s) and the provider timeout (≤ 15 s), so the function answers
// "unconfirmed" itself instead of being cut off. server/deployConfig.test.ts checks the chain.

export async function POST(request: Request): Promise<Response> {
  // Behind Vercel's proxy the client IP is the first x-forwarded-for entry.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
  return endpoint.handle(request, ip)
}
