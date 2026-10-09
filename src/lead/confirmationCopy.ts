/**
 * Confirmation copy by delivery mode. "resend" = the email provider accepted the email; "mock" = a
 * demo deployment or local development where nothing is sent – then no line may claim a send.
 */
import { lead } from '../content/cs'
import type { DeliveryMode } from './client'

export interface ConfirmationCopy {
  title: string
  sentTo: string
  /** Text after the address; empty = the sentence ends with a full stop after the address. */
  sentToTail: string
  notArrived: string
  resend: string
  /** Extra demo notice under the confirmation, or null. */
  notice: string | null
  alreadySent: (email: string) => string
}

export function confirmationCopy(delivery: DeliveryMode): ConfirmationCopy {
  if (delivery === 'mock') {
    const m = lead.successMock
    return { title: m.title, sentTo: m.sentTo, sentToTail: m.sentToTail, notArrived: m.notArrived, resend: m.resend, notice: m.mockNotice, alreadySent: lead.alreadySentMock }
  }
  const s = lead.success
  return { title: s.title, sentTo: s.sentTo, sentToTail: s.sentToTail, notArrived: s.notArrived, resend: s.resend, notice: null, alreadySent: lead.alreadySent }
}
