import { describe, expect, it } from 'vitest'
import { isLoopback } from './devApi'

describe('dev outbox access', () => {
  it.each(['127.0.0.1', '127.0.1.1', '::1', '::ffff:127.0.0.1'])('allows loopback %s', (a) => {
    expect(isLoopback(a)).toBe(true)
  })

  it.each([undefined, '', '192.168.1.20', '10.0.0.5', '::ffff:192.168.1.20', 'fe80::1', '128.0.0.1'])('refuses %s', (a) => {
    expect(isLoopback(a)).toBe(false)
  })
})
