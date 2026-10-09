/**
 * After a failed submission the email field is focused again, so keyboard and screen-reader users
 * land on the field that the error describes (aria-describedby) and can fix it or press Enter to
 * retry. While sending, the field and button are disabled, which drops focus to <body>.
 *
 * Focus is restored only if the visitor has not moved elsewhere in the meantime: when nothing has
 * focus (body / null) or focus is still inside this form.
 */
export interface FocusLike {
  contains(other: unknown): boolean
}

export function shouldRestoreFocus(active: unknown, body: unknown, form: FocusLike | null): boolean {
  if (active === null || active === undefined || active === body) return true
  return form !== null && form.contains(active)
}
