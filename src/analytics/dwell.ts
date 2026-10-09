/**
 * "Seen" = at least half of the element in the viewport, continuously, for a minimum time
 * (README §6). The timing logic is separate from IntersectionObserver so it can be tested.
 */
export const VIEW_THRESHOLD = 0.5
export const VIEW_DWELL_MS = 1000

export class DwellTimer {
  private timer: ReturnType<typeof setTimeout> | null = null
  private done = false
  private readonly dwellMs: number
  private readonly onSeen: () => void

  constructor(dwellMs: number, onSeen: () => void) {
    this.dwellMs = dwellMs
    this.onSeen = onSeen
  }

  /** Report the current visibility; fires onSeen once after dwellMs of uninterrupted visibility. */
  update(visible: boolean): void {
    if (this.done) return
    if (visible && this.timer === null) {
      this.timer = setTimeout(() => {
        this.timer = null
        this.done = true
        this.onSeen()
      }, this.dwellMs)
    } else if (!visible && this.timer !== null) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  dispose(): void {
    if (this.timer !== null) clearTimeout(this.timer)
    this.timer = null
  }
}
