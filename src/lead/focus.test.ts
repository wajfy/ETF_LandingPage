import { describe, expect, it } from 'vitest'
import { shouldRestoreFocus } from './focus'

const body = { name: 'body' }
const insideButton = { name: 'retry button' }
const elsewhere = { name: 'a link in the comparison' }
const form = { contains: (el: unknown) => el === insideButton }

describe('focus after a failed submission', () => {
  it('restores focus when it was dropped to <body> by the disabled field/button', () => {
    expect(shouldRestoreFocus(body, body, form)).toBe(true)
    expect(shouldRestoreFocus(null, body, form)).toBe(true)
  })

  it('restores focus when it is still inside the form (e.g. on the retry button)', () => {
    expect(shouldRestoreFocus(insideButton, body, form)).toBe(true)
  })

  it('does not steal focus if the visitor moved elsewhere while waiting', () => {
    expect(shouldRestoreFocus(elsewhere, body, form)).toBe(false)
    expect(shouldRestoreFocus(elsewhere, body, null)).toBe(false)
  })
})
