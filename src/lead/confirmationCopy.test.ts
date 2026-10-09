import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { confirmationCopy } from './confirmationCopy'

const ADDRESS = 'test@example.cz'
const allText = (c: ReturnType<typeof confirmationCopy>) =>
  [c.title, c.sentTo, c.sentToTail, c.notArrived, c.resend, c.notice ?? '', c.alreadySent(ADDRESS)].join(' ')

describe('demo (mock) confirmation', () => {
  const mock = confirmationCopy('mock')

  it('says the send was simulated and no email went out', () => {
    expect(mock.title).toMatch(/neodeslal/)
    expect(`${mock.sentTo} ${ADDRESS} ${mock.sentToTail}`).toMatch(/nasimulovali.*Žádný e-mail neodešel/)
    expect(mock.alreadySent(ADDRESS)).toMatch(/ukázku, žádný e-mail neodešel/)
    expect(mock.notice).toMatch(/odesílání e-mailů je vypnuté/)
  })

  it('never claims a real send, points to the inbox, or names a dev-only URL', () => {
    const text = allText(mock)
    expect(text).not.toMatch(/poslali|nechali poslat|Spam|Hromadné|Hotovo/)
    expect(text).not.toMatch(/\/api\/|outbox/)
  })
})

describe('real (provider-accepted) confirmation', () => {
  const real = confirmationCopy('resend')

  it('keeps the approved copy and shows no demo notice', () => {
    expect(real.title).toBe('Hotovo ✓')
    expect(real.sentTo).toBe('Srovnání a checklist jsme poslali na')
    expect(real.sentToTail).toBe('')
    expect(real.notice).toBeNull()
    expect(real.alreadySent(ADDRESS)).toContain(`nechali poslat na ${ADDRESS}`)
    expect(allText(real)).not.toMatch(/ukázk|nasimul|MOCK/i)
  })
})

describe('LeadForm wiring', () => {
  const form = readFileSync(join(import.meta.dirname, '../components/LeadForm.tsx'), 'utf8')

  it('takes every confirmation line from confirmationCopy(sent.delivery)', () => {
    expect(form).toContain('confirmationCopy(sent.delivery)')
    expect(form).not.toMatch(/copy\.success\.(title|sentTo|notArrived|resend|mockNotice)|copy\.alreadySent\(/)
  })
})
