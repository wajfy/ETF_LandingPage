import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { isLoopback } from './devApi'

const root = join(import.meta.dirname, '..')
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return sources(p)
    return /\.(ts|tsx)$/.test(name) && !name.endsWith('.test.ts') ? [relative(root, p).replace(/\\/g, '/')] : []
  })
}

describe('dev outbox stays a dev-server detail', () => {
  it('nothing outside the Vite dev middleware mentions /api/dev/outbox (it does not exist in a deployment)', () => {
    const files = [...sources(join(root, 'src')), ...sources(join(root, 'server')), ...sources(join(root, 'api'))]
    const mentions = files.filter((f) => f !== 'server/devApi.ts' && readFileSync(join(root, f), 'utf8').includes('dev/outbox'))
    expect(mentions).toEqual([])
  })
})

describe('dev outbox access', () => {
  it.each(['127.0.0.1', '127.0.1.1', '::1', '::ffff:127.0.0.1'])('allows loopback %s', (a) => {
    expect(isLoopback(a)).toBe(true)
  })

  it.each([undefined, '', '192.168.1.20', '10.0.0.5', '::ffff:192.168.1.20', 'fe80::1', '128.0.0.1'])('refuses %s', (a) => {
    expect(isLoopback(a)).toBe(false)
  })
})
