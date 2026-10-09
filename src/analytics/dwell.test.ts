import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DwellTimer, VIEW_DWELL_MS } from './dwell'

describe('DwellTimer (at least half visible for at least 1 s)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires after uninterrupted visibility, once', () => {
    const seen = vi.fn()
    const t = new DwellTimer(VIEW_DWELL_MS, seen)
    t.update(true)
    vi.advanceTimersByTime(VIEW_DWELL_MS - 1)
    expect(seen).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    t.update(false)
    t.update(true)
    vi.advanceTimersByTime(VIEW_DWELL_MS * 5)
    expect(seen).toHaveBeenCalledTimes(1)
  })

  it('does not fire when the element is scrolled past quickly', () => {
    const seen = vi.fn()
    const t = new DwellTimer(VIEW_DWELL_MS, seen)
    t.update(true)
    vi.advanceTimersByTime(600)
    t.update(false)
    t.update(true)
    vi.advanceTimersByTime(600)
    t.update(false)
    vi.advanceTimersByTime(VIEW_DWELL_MS * 5)
    expect(seen).not.toHaveBeenCalled()
  })

  it('stops on dispose (unmount)', () => {
    const seen = vi.fn()
    const t = new DwellTimer(VIEW_DWELL_MS, seen)
    t.update(true)
    t.dispose()
    vi.advanceTimersByTime(VIEW_DWELL_MS * 2)
    expect(seen).not.toHaveBeenCalled()
  })
})
