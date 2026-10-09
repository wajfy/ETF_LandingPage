/**
 * Vite dev-server middleware: serves POST /api/lead locally with the same handler as production,
 * plus a MOCK-ONLY preview of generated emails at GET /api/dev/outbox (never in production builds:
 * the serverless entry api/lead.ts does not expose it).
 *
 * Environment: read with Vite's loadEnv from .env / .env.local (server-side only; variables are not
 * VITE_-prefixed, so they never reach the browser bundle).
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import { loadEnv, type Plugin, type ViteDevServer } from 'vite'

type EndpointModule = typeof import('./lead/endpoint')
type Endpoint = ReturnType<EndpointModule['createLeadEndpoint']>

const MAX_DEV_BODY = 64 * 1024

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    size += (chunk as Buffer).length
    if (size > MAX_DEV_BODY) break
    chunks.push(chunk as Buffer)
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function toWebRequest(req: IncomingMessage): Promise<Request> {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`)
  const headers = new Headers()
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === 'string') headers.set(k, v)
    else if (Array.isArray(v)) headers.set(k, v.join(', '))
  }
  const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req)
  return new Request(url, { method: req.method, headers, body })
}

async function sendWebResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status
  response.headers.forEach((value, key) => res.setHeader(key, value))
  res.end(await response.text())
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** The outbox preview answers only requests from this machine (also when the dev server runs with --host). */
export function isLoopback(remoteAddress: string | undefined): boolean {
  if (!remoteAddress) return false
  return remoteAddress === '::1' || remoteAddress.startsWith('127.') || remoteAddress.startsWith('::ffff:127.')
}

function outboxPage(endpoint: Endpoint): Response {
  const entries = endpoint.mockOutbox?.entries() ?? []
  const rows = entries
    .map((e, i) => `<li><a href="/api/dev/outbox/${i}">${esc(e.subject)}</a> → ${esc(e.toMasked)} <small>(${esc(e.id)})</small> · <a href="/api/dev/outbox/${i}?format=text">text</a></li>`)
    .join('')
  return new Response(
    `<!doctype html><meta charset="utf-8"><title>Mock outbox</title><body style="font-family:system-ui;padding:24px;max-width:720px"><h1>Mock outbox (local only)</h1><p>MOCK mode: nothing was sent. In memory only – a server restart clears it. Newest first.</p><ol>${rows || '<li>Empty</li>'}</ol></body>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  )
}

export function leadDevApi(): Plugin {
  let cached: { mod: EndpointModule; endpoint: Endpoint } | null = null
  return {
    name: 'lead-dev-api',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      const env = { ...loadEnv(server.config.mode, server.config.root, ''), NODE_ENV: 'development' }
      const getEndpoint = async (): Promise<Endpoint> => {
        const mod = (await server.ssrLoadModule('/server/lead/endpoint.ts')) as EndpointModule
        if (!cached || cached.mod !== mod) {
          cached = { mod, endpoint: mod.createLeadEndpoint(env) }
          // The outbox exists only here (Vite dev server), so only the dev server mentions it.
          if (cached.endpoint.mockOutbox) server.config.logger.info('[lead] local dev server only: generated mock emails at /api/dev/outbox')
        }
        return cached.endpoint
      }

      server.middlewares.use(async (req, res, next) => {
        const path = (req.url ?? '').split('?')[0]
        if (!path.startsWith('/api/')) return next()
        try {
          const endpoint = await getEndpoint()
          if (path === '/api/lead') {
            const ip = req.socket.remoteAddress ?? ''
            return await sendWebResponse(res, await endpoint.handle(await toWebRequest(req), ip))
          }
          if (path.startsWith('/api/dev/outbox') && req.method === 'GET' && endpoint.mockOutbox && isLoopback(req.socket.remoteAddress)) {
            const idx = path.split('/')[4]
            if (idx === undefined || idx === '') return await sendWebResponse(res, outboxPage(endpoint))
            const entry = endpoint.mockOutbox.entries()[Number(idx)]
            if (!entry) return await sendWebResponse(res, new Response('Not found', { status: 404 }))
            const asText = (req.url ?? '').includes('format=text')
            return await sendWebResponse(
              res,
              new Response(asText ? entry.text : entry.html, {
                headers: { 'Content-Type': `${asText ? 'text/plain' : 'text/html'}; charset=utf-8`, 'Cache-Control': 'no-store' },
              }),
            )
          }
          return await sendWebResponse(res, new Response(JSON.stringify({ status: 'error', code: 'not_found' }), { status: 404, headers: { 'Content-Type': 'application/json' } }))
        } catch (err) {
          // Error name only – a message could echo request content.
          server.config.logger.error(`[lead] dev middleware error: ${err instanceof Error ? err.name : 'unknown'}`)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ status: 'error', code: 'send_failed' }))
        }
      })
    },
  }
}
