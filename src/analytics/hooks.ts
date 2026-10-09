/**
 * React hooks: the tracker from context, and useSeenOnce, which reports when an element has been
 * seen (at least 50 % for at least 1 s, tab visible).
 */
import { useContext, useEffect, useRef, type RefObject } from 'react'
import { DwellTimer, VIEW_DWELL_MS, VIEW_THRESHOLD } from './dwell'
import type { Tracker } from './tracker'
import { TrackerContext } from './trackerContext'

export function useTracker(): Tracker {
  return useContext(TrackerContext)
}

/** Calls onSeen once per mount of `ref`'s element, after it has been visible long enough. */
export function useSeenOnce(ref: RefObject<Element | null>, onSeen: () => void, enabled = true): void {
  const callback = useRef(onSeen)
  useEffect(() => {
    callback.current = onSeen
  })

  useEffect(() => {
    const el = ref.current
    if (!enabled || !el || typeof IntersectionObserver === 'undefined') return
    let intersecting = false
    const timer = new DwellTimer(VIEW_DWELL_MS, () => callback.current())
    const update = () => timer.update(intersecting && document.visibilityState === 'visible')
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Half of the element – or, for an element taller than two screens, half of the screen.
        const viewport = entry.rootBounds?.height ?? window.innerHeight
        intersecting =
          entry.isIntersecting && (entry.intersectionRatio >= VIEW_THRESHOLD || entry.intersectionRect.height >= viewport * VIEW_THRESHOLD)
        update()
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, VIEW_THRESHOLD, 0.6, 0.7, 0.8, 0.9, 1] },
    )
    observer.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
      timer.dispose()
    }
  }, [ref, enabled])
}
